import { Parser } from "xml2js";

async function fetchFeedData(feedUrl: string) {
    const response = await fetch(feedUrl);
    const xmlData = await response.text();
    const parser = new Parser();
    const jsonData = await parser.parseStringPromise(xmlData);
    return jsonData.rss.channel[0].item;
}

function filterNewItems(items: any[], interval: number) {
    return items.filter(item => {
      const timeDifference = new Date().getTime() - new Date(item.pubDate[0]).getTime();
      return timeDifference <= interval;
    });
}

export async function checkForNewItems(feedUrls: string[], interval: number) {
    try {
        let items = [];
        for (const feedUrl of feedUrls) {
            const data = await fetchFeedData(feedUrl);
            items.push(...data);
        }
        const newItems = filterNewItems(items, interval);
        return newItems
    } catch (error) {
      console.error('Error in checkForNewItems:', error);
    } finally {
        return [];
    }
}