## 1. Who We Are

This Privacy Policy describes how the Commie Discord bot and its companion web Dashboard ("the Service") collect, use, and store information.

## 2. Information We Collect

**Through Discord (when you use bot commands):**
- Your Discord user ID, username, and the content of commands you send to the Bot.
- Server (guild) IDs and configuration you or your server's administrators set (prefix, language, welcome/leave messages, starboard settings, autoroles, ticket configuration, reminders, tags, giveaways).

**Through the Dashboard (when you log in with Discord):**
- Your Discord user ID, username, avatar, and discriminator, as provided by Discord's OAuth2 API.
- The list of servers you manage (used only to determine which servers you can configure — we do not store this list beyond your active session).
- A short-lived Discord access token, embedded in your own session token, used to re-verify your server permissions on each request.

**We do not collect:**
- Your Discord password (authentication happens entirely through Discord's own OAuth2 flow).
- Message content from channels the Bot has not been explicitly asked to read or act on.

## 3. How We Use Information

We use the information above solely to operate the Service: executing bot commands, persisting per-server configuration, authenticating Dashboard sessions, and enforcing which users may configure which servers.

## 4. Where Data Is Stored

Configuration data is stored in MongoDB (guild settings, tags) and PostgreSQL (reminders, giveaways, timezones, audit logs), hosted by third-party database providers. Your Dashboard session token is stored in your browser's local storage, not in a cookie, and is never transmitted to any party other than this Service's own API.

## 5. Third Parties

We share data with:
- **Discord Inc.**, as necessary to operate the Bot and Dashboard (see Discord's own Privacy Policy for how Discord itself handles your data).
- Our database and hosting providers, solely as infrastructure to store the data described above — they do not use it for their own purposes.

We do not sell your data to advertisers or other third parties.

## 6. Data Retention

Server configuration persists for as long as the Bot remains in that server, or until an administrator changes it. Some data (such as pending reminders tied to a deleted channel or server) is automatically cleaned up. To request deletion of data associated with your account or server, contact us via our support server.

## 7. Children's Privacy

The Service is not directed at children under 13 (or the minimum age required by Discord's own Terms of Service in your region). We do not knowingly collect information from users below this age.

## 8. Your Rights

Depending on your jurisdiction, you may have rights to access, correct, or request deletion of your data. Contact us via our support server to make such a request.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision.

## 10. Contact

Questions about this Privacy Policy can be directed to our support server (linked in the footer of this site).

---
