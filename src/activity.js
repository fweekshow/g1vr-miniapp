export default async function handler(req, res) {
  const { orgId } = req.query;
  if (!orgId) {
    return res.status(400).json({ error: 'Missing orgId parameter' });
  }
  try {
    // 1. Search for the org by EIN to get the UUID
    const searchUrl = `https://api.endaoment.org/v2/orgs/search?searchTerm=${orgId}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!Array.isArray(searchData) || searchData.length === 0) {
      return res.status(404).json({ error: 'Organization not found for given EIN' });
    }

    const uuid = searchData[0].id;

    // 2. Fetch the activity feed by UUID
    const activityRes = await fetch(`https://api.endaoment.org/v1/activity/org/${uuid}`);
    const activityText = await activityRes.text();
    if (!activityRes.ok) {
      return res.status(activityRes.status).json({ error: 'Failed to fetch activity from Endaoment', details: activityText });
    }
    const activityData = JSON.parse(activityText);

    // 3. Extract actual donor addresses from transaction logs
    const apiKey = process.env.BASESCAN_API_KEY;
    const activitiesWithRealSenders = await Promise.all(
      activityData.map(async (activity) => {
        if (activity.transactionHash && activity.chainId) {
          try {
            // Get transaction receipt to find the "Deposited" event
            const receiptUrl = activity.chainId === 8453 
              ? `https://api.basescan.org/api?module=proxy&action=eth_getTransactionReceipt&txhash=${activity.transactionHash}&apikey=${apiKey}`
              : `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${activity.transactionHash}&apikey=${apiKey}`;

            const receiptResponse = await fetch(receiptUrl);
            const receiptData = await receiptResponse.json();

            if (receiptData.result && receiptData.result.logs) {
              // Look for the actual donor address in the logs
              // Based on the test, the first log often contains the donor address
              for (const log of receiptData.result.logs) {
                if (log.topics && log.topics.length >= 2) {
                  // Extract address from the second topic (first parameter)
                  const addressTopic = log.topics[1];
                  if (addressTopic && addressTopic.startsWith('0x000000000000000000000000')) {
                    const accountAddress = '0x' + addressTopic.slice(26); // Remove the 0x and 24 zeros padding
                    console.log('Found donor address in log:', accountAddress);
                    return { ...activity, actualSender: accountAddress };
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error extracting donor address:', error);
          }
        }
        return activity;
      })
    );

    res.status(200).json(activitiesWithRealSenders);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
} 