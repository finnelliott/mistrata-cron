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
        console.log(items.length)
        const newItems = filterNewItems(items, interval);
        return newItems.filter((value, index, self) => 
            self.findIndex(item => item.title[0] === value.title[0]) === index
        );
    } catch (error) {
      console.error('Error in checkForNewItems:', error);
      return [];
    }
}