// test-api.js
// Test script for API endpoints

const axios = require('axios'); // You'll need to install this
// OR use native fetch if using Node.js 18+

const API_URL = 'http://localhost:3000';

// If you don't have axios installed, use this instead:
// npm install axios
// Or use the native fetch (shown below)

async function testAPI() {
  console.log('🚀 Testing Campus Navigation API\n');
  console.log('=' .repeat(50));

  // Test 1: Health Check
  console.log('\n📋 Test 1: Health Check');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Response:', data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 2: Get All Places
  console.log('\n📋 Test 2: Get All Places');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${API_URL}/api/v1/places`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Message:', data.message);
    
    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} places`);
      console.log('\nFirst 5 places:');
      data.data.slice(0, 5).forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name} (${place.category})`);
      });
    } else {
      console.log('⚠️ No places found in database');
    }
    
    if (data.pagination) {
      console.log('\nPagination info:');
      console.log('  Page:', data.pagination.page);
      console.log('  Limit:', data.pagination.limit);
      console.log('  Total:', data.pagination.total);
      console.log('  Total Pages:', data.pagination.totalPages);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 3: Get Places with Category Filter
  console.log('\n📋 Test 3: Get Places by Category');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${API_URL}/api/v1/places?category=academic`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    
    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} academic places`);
      data.data.forEach((place) => {
        console.log(`  - ${place.name}`);
      });
    } else {
      console.log('⚠️ No academic places found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 4: Search Places
  console.log('\n📋 Test 4: Search Places');
  console.log('-'.repeat(30));
  try {
    const response = await fetch(`${API_URL}/api/v1/places?search=library`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    
    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} places matching "library"`);
      data.data.forEach((place) => {
        console.log(`  - ${place.name}`);
      });
    } else {
      console.log('⚠️ No places found for "library"');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 5: Get Single Place (if we have places)
  console.log('\n📋 Test 5: Get Single Place');
  console.log('-'.repeat(30));
  try {
    // First, get all places to find an ID
    const placesResponse = await fetch(`${API_URL}/api/v1/places?limit=1`);
    const placesData = await placesResponse.json();
    
    if (placesData.data && placesData.data.length > 0) {
      const placeId = placesData.data[0].id;
      console.log(`✅ Testing with place ID: ${placeId}`);
      
      const response = await fetch(`${API_URL}/api/v1/places/${placeId}`);
      const data = await response.json();
      console.log('✅ Status:', response.status);
      console.log('✅ Success:', data.success);
      
      if (data.data) {
        console.log('Place details:');
        console.log('  Name:', data.data.name);
        console.log('  Category:', data.data.category);
        console.log('  Description:', data.data.description || 'No description');
      }
    } else {
      console.log('⚠️ No places available to test single place endpoint');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  // Test 6: Get Nearby Places
  console.log('\n📋 Test 6: Get Nearby Places');
  console.log('-'.repeat(30));
  try {
    // Using University of Limpopo coordinates
    const lat = -23.8884;
    const lng = 29.7386;
    const response = await fetch(`${API_URL}/api/v1/places/nearby?lat=${lat}&lng=${lng}&radius=500`);
    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Success:', data.success);
    
    if (data.data && data.data.length > 0) {
      console.log(`✅ Found ${data.data.length} nearby places`);
    } else {
      console.log('⚠️ No nearby places found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎯 API Testing Complete!');
}

// Run the tests
testAPI();