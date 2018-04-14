# A boilerplate Express Node server

You need a simple server to start testing some stuff? Well here yuh go.

---

## Installation

```sh
yarn
```

---

## Starting server

```sh
# prod
yarn start

# list available commands
yarn start --help

# dev - watches for file changes
yarn start --dev
# OR
yarn start -d
```
---

## Testing endpoints

You'll see on start of the app that there are 3 examples. One for `GET` and two
for `POST` that utilize the `fetch` API.

The app is also wired up with Socket.IO to allow for external requests to the
server's API and display the requests output in the app. For example if you
open up Postman and make these requests you'll see the output in the app:

```
[GET]  - http://localhost:8081/api/v1/get/it/1234?fu=test&bar=test2

[POST] - http://localhost:8081/api/v1/post/it
         └─ Body
           ├─ raw: {"fu":"test","bar":"test2"}
           └─ Select 'JSON (application/json)' from dropdown (or add the header manually)

[POST] - http://localhost:8081/api/v1/post/it
         └─ Body
           ├─ raw: {"fu":"test","bam":"test2"}
           └─ Select 'JSON (application/json)' from dropdown (or add the header manually)
```
