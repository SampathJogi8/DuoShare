async function main() {
  const workerUrl = 'https://duoshare-backend.sampathjogipusala123.workers.dev/api/query';
  const testRoomId = 'TEST' + Math.floor(1000 + Math.random() * 9000);
  const testRoomName = 'Testing Lab Room';

  console.log(`Creating Test Room on Cloudflare Worker D1: ID = ${testRoomId}...`);

  // 1. Create Room
  const roomRes = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table: 'rooms',
      action: 'insert',
      data: {
        id: testRoomId,
        name: testRoomName,
        monthly_budget: 6000,
        created_by: 'test_host_uid'
      }
    })
  });

  const roomData = await roomRes.json();
  console.log("Room Created Result:", roomData);

  // 2. Add 3 Members (Person A, Person B, Person C)
  const members = [
    { id: 'mem_a_' + Date.now(), room_id: testRoomId, uid: 'uid_person_a', nickname: 'Person A', role: 'host' },
    { id: 'mem_b_' + Date.now(), room_id: testRoomId, uid: 'uid_person_b', nickname: 'Person B', role: 'member' },
    { id: 'mem_c_' + Date.now(), room_id: testRoomId, uid: 'uid_person_c', nickname: 'Person C', role: 'member' }
  ];

  const memRes = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      table: 'members',
      action: 'insert',
      data: members
    })
  });

  const memData = await memRes.json();
  console.log("Members Added Result:", memData);

  console.log("\n==========================================");
  console.log(`🎉 TEST ROOM CREATED ON CLOUDFLARE WORKER D1!`);
  console.log(`ROOM CODE: ${testRoomId}`);
  console.log("==========================================");
}

main();
