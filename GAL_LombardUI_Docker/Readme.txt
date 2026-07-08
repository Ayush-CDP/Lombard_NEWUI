Prerequisites (Client Must Have)
Requirement	Version	Download
Docker Desktop	Latest	docker.com/get-started
OS	Windows 10/11, macOS, or Linux	—
That's it. No Node.js, no Angular CLI needed on the client machine.

Steps for Client
1. Extract the zip


Unzip GAL_LombardUI_Docker.zip
2. Open terminal inside the extracted folder


# Should see: Dockerfile, nginx.conf, src/, package.json, etc.
3. Build the Docker image (takes ~3-5 min first time)


docker build -t gal-lombard-ui .
4. Run the container


docker run -d -p 80:80 --name gal-lombard-ui gal-lombard-ui
5. Open in browser


http://localhost
To stop the container:


docker stop gal-lombard-ui
To start it again later:


docker start gal-lombard-ui
Critical Notes to Tell the Client
1. Backend API must be running
The app is hardcoded to call http://10.235.84.7:5000/api (in environment.prod.ts).
The client's backend server must be running and reachable at that IP from their machine.
If the backend IP is different on their end, update environment.prod.ts:3 before zipping.

2. Azure AD / MSAL Redirect URI
The production redirectUri is currently http://localhost:4200/ but Docker serves on port 80 (http://localhost).
Either:

Add http://localhost as an allowed redirect URI in their Azure AD app registration, OR
Change environment.prod.ts:9 to http://localhost/ before sending
3. First build downloads packages
During docker build, Node packages are downloaded from the internet (~500MB). Client needs a working internet connection for the first build.

4. Port 80 must be free
If port 80 is already in use (e.g., IIS, another web server), use a different port:


docker run -d -p 8080:80 --name gal-lombard-ui gal-lombard-ui
# Then open: http://localhost:8080
Bottom line: Fix the redirectUri in environment.prod.ts to http://localhost/ before you zip and send — that's the most likely thing to cause a login failure on the client's machine.