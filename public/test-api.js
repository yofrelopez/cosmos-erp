// Test script para verificar el API de quotes
console.log('Testing quotes API...');

async function testQuotesAPI() {
  try {
    console.log('Fetching quotes...');
    const response = await fetch('/api/quotes');
    const data = await response.json();
    console.log('Quotes data:', data);
    
    if (data.quotes && data.quotes.length > 0) {
      const firstQuote = data.quotes[0];
      console.log('First quote:', firstQuote);
      console.log('First quote items:', firstQuote.items);
      
      if (firstQuote.items && firstQuote.items.length > 0) {
        const firstItem = firstQuote.items[0];
        console.log('First item:', firstItem);
        console.log('First item images:', firstItem.images);
        console.log('Images count:', firstItem.images?.length || 0);
      }
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testQuotesAPI();