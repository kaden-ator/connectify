

async function testGetRequest(){

    const attempt = { username: "someUsername", password: "somePassword" };
    const usersList = [{ username: "someUsername", password: "somePassword" }, { username: "someUsername", password: "somePassword" }, { username: "someUsername", password: "somePassword" }]

    const result = await fetch('http://localhost:8888', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({attempt, usersList}) 
    });
    const data = await result.json();
    console.log(data);
    return data;
}

testGetRequest();