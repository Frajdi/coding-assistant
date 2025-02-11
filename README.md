You need a .env file inside the server folder with a structure like below.

```
OPENAI_KEY="xxxxx"
GITHUB_CLIENT_ID="xxxxxx"
GITHUB_CLIENT_SECRET="xxxxxxx"
COOKIE_KEY_1="mainKey"
COOKIE_KEY_2="rotationKey"
```

You can run the app with the commands from the make file.

    -make start
    -make stop
    -make clean
    -make restart

Make sure you have docker runing.

After runinng make start make sure to open it on https like below:

https://localhost:3000





This is the schema of how the comunication with ai works.
![Alt text](image.png)

