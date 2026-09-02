import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mphuwixprztbzrxndqsl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHV3aXhwcnp0YnpyeG5kcXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzA5NjEsImV4cCI6MjA5NzY0Njk2MX0.ZRkGOUewER5uCMeohVGAnOvmI9faSZazAy2p4NNcUow';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const testRoomId = 'TEST' + Math.floor(1000 + Math.random() * 9000);
  const testRoomName = 'Testing Lab Room';

  console.log(`\nCreating Test Room: ID = ${testRoomId}, Name = ${testRoomName}...`);
  const { data: newRoom, error: createRoomErr } = await supabase
    .from('rooms')
    .insert({
      id: testRoomId,
      name: testRoomName,
      monthly_budget: 6000,
      created_by: 'test_host_uid'
    })
    .select()
    .single();

  if (createRoomErr) {
    console.error("Error creating test room:", createRoomErr);
    return;
  }

  console.log("Test Room Created Successfully:", newRoom);

  // Add 3 Test Members
  const testMembers = [
    { room_id: testRoomId, uid: 'uid_person_a', nickname: 'Person A' },
    { room_id: testRoomId, uid: 'uid_person_b', nickname: 'Person B' },
    { room_id: testRoomId, uid: 'uid_person_c', nickname: 'Person C' }
  ];

  console.log("Adding 3 Test Roommates (Person A, Person B, Person C)...");
  const { data: addedMems, error: memErr } = await supabase
    .from('members')
    .insert(testMembers)
    .select();

  if (memErr) {
    console.error("Error adding test members:", memErr);
    return;
  }

  console.log("Members added successfully:", addedMems);
  console.log("\n==========================================");
  console.log(`🎉 TEST ROOM CREATED SUCCESSFULLY!`);
  console.log(`ROOM CODE: ${testRoomId}`);
  console.log("==========================================");
}

main();
