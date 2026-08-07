import { createServer } from "node:http";

// req - Request
// res - Response

const server = createServer((req, res) => {
  const person = { firstname: "John", lastname: "Rambo" };

  // res.writeHead(200, { "Content-Type": "application/json" });
  // res.end(JSON.stringify(person));

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<body><h1>Hello World!</h1></body>");
});

// starts a simple http server locally on port 3000
server.listen(3000, "127.0.0.1", () => {
  console.log("Listening on 127.0.0.1:3000");
});

// run with `node server.mjs`
