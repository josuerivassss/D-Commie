## 1. Who We Are

This Privacy Policy describes how Commie ("the Service") and its companion web dashboard ("the Web Service") collect, use, and store information.

## 2. Information We Collect

**Through the Service (when you or others use its commands and features):**
- Your Discord user ID, username, and the content of commands you send to the Service.
- Server (guild) IDs and configuration set by server administrators (prefix, language, welcome/leave messages, starboard settings, autoroles, ticket configuration, reminders, tags, giveaways).
- Message content, but only for specific features that inherently require reading a message to function — for example, reproducing a message on the starboard once it receives enough reactions, or including message text in a support ticket's closing transcript. See Section 3 for details.

**Through the Web Service (when you log in with Discord):**
- Your Discord user ID, username, avatar, and discriminator, as provided by Discord's OAuth2 API.
- The list of servers you manage (used only to determine which servers you can configure — we do not store this list beyond your active session).
- A short-lived Discord access token, embedded in your own session token, used to re-verify your server permissions on each request.

**We do not collect:**
- Your Discord password (authentication happens entirely through Discord's own OAuth2 flow).
- Message content from channels or messages the Service has no feature actively reading.

## 3. Message Content in Detail

Discord requires bots to request a privileged permission to receive the text content of messages. We use this solely to operate specific features that need it to function, such as reproducing highlighted messages on a server's starboard or including message text in a ticket's closing transcript.

We do not store message content beyond what a feature's own operation requires, we do not read it for any purpose outside operating these features, and it is never sold, shared with advertisers, or used to build user profiles. Server administrators are solely responsible for the content they configure through features like tags, embeds, and welcome/leave messages, and for how the Service forwards or displays that content to their server's members; the Service, its creator, and its development team assume no responsibility for that content.

## 4. How We Use Information

We use the information above solely to operate the Service and the Web Service: executing commands, persisting per-server configuration, authenticating Web Service sessions, and enforcing which users may configure which servers.

## 5. Where Data Is Stored

Configuration data is stored in MongoDB (guild settings, tags) and PostgreSQL (reminders, giveaways, timezones, audit logs), hosted by third-party database providers. Your Web Service session token is stored in your browser's local storage, not in a cookie, and is never transmitted to any party other than the Web Service's own API.

## 6. Third Parties

We share data with:
- **Discord Inc.**, as necessary to operate the Service and Web Service (see Discord's own Privacy Policy for how Discord itself handles your data).
- Our database and hosting providers, solely as infrastructure to store the data described above — they do not use it for their own purposes.

We do not sell your data to advertisers or other third parties.

## 7. Data Retention

Server configuration persists for as long as the Service remains in that server, or until an administrator changes it. Some data (such as pending reminders tied to a deleted channel or server, or starboard/ticket-transcript content tied to a deleted message or ticket) is automatically cleaned up or removed alongside what it references. To request deletion of data associated with your account or server, contact us via our support server.

## 8. Children's Privacy

The Service is not directed at children under 13 (or the minimum age required by Discord's own Terms of Service in your region). We do not knowingly collect information from users below this age.

## 9. Your Rights

Depending on your jurisdiction, you may have rights to access, correct, or request deletion of your data. Contact us via our support server to make such a request.

## 10. Changes to This Policy

We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision.

## 11. Contact

Questions about this Privacy Policy can be directed to our support server (linked in the footer of this site).