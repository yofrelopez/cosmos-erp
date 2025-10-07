// Test API endpoints
console.log('Testing glass options API...');

async function testGlassOptionsAPI() {
  try {
    console.log('1. Testing families endpoint...');
    const familiesResponse = await fetch('/api/calculator/glass-options?companyId=1');
    const familiesData = await familiesResponse.json();
    console.log('Families:', familiesData);
    
    if (familiesData.families && familiesData.families.length > 0) {
      const firstFamily = familiesData.families[0];
      console.log(`2. Testing thicknesses for family: ${firstFamily}...`);
      const thicknessResponse = await fetch(`/api/calculator/glass-options?companyId=1&family=${firstFamily}`);
      const thicknessData = await thicknessResponse.json();
      console.log('Thicknesses:', thicknessData);
      
      if (thicknessData.thicknesses && thicknessData.thicknesses.length > 0) {
        const firstThickness = thicknessData.thicknesses[0];
        console.log(`3. Testing colorTypes for family: ${firstFamily}, thickness: ${firstThickness}...`);
        const colorTypeResponse = await fetch(`/api/calculator/glass-options?companyId=1&family=${firstFamily}&thickness=${firstThickness}`);
        const colorTypeData = await colorTypeResponse.json();
        console.log('ColorTypes:', colorTypeData);
      }
    }
    
    console.log('4. Testing glasses endpoint...');
    const glassesResponse = await fetch('/api/calculator/glasses?companyId=1');
    const glassesData = await glassesResponse.json();
    console.log('Glasses:', glassesData);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the test
testGlassOptionsAPI();