/** User class for message.ly */
const bcrypt = require("bcrypt");
const db = require("../db");

/** User of the site. */

class User {
  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      let hased_pw = await bcrypt.hash(password, 12);
      const result = await db.query(`INSERT INTO users (username, password, first_name, last_name, phone, join_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,[username, hased_pw, first_name, last_name, phone]);
      // console.log(result.rows)
      this.updateLoginTimestamp(username)
      return result.rows[0];
    } catch (e) {
      return e
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await db.query(`SELECT * FROM users WHERE username=$1`, [
        username,
      ]);
      this.updateLoginTimestamp(username)
      return await bcrypt.compare(password, result.rows[0].password)
    } catch (e) {
      return e
    }
  }
  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const result = await db.query(`UPDATE users SET last_login_at=NOW() WHERE username=$1 RETURNING last_login_at`, [username])
      return 'updated time'
    } catch (e) {
      return e
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const results = await db.query(`SELECT  username, first_name, last_name, phone FROM users`)
      return results.rows
    } catch (e) {
      return e
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const user = await db.query(`SELECT username,first_name,last_name,phone,join_at,last_login_at FROM users WHERE username=$1 `, [username])
    return user.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */


  static async messagesFrom(username) {
    const messages = await db.query(`SELECT id,to_username as to_user, body, sent_at, read_at FROM messages  WHERE from_username=$1`, [username])
    for (let msg of messages.rows) {
      let usr = await db.query(`SELECT first_name, last_name, phone, username FROM users WHERE username=$1`, [msg.to_user])
      msg.to_user = usr.rows[0]
    }
    return messages.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const messages = await db.query(`SELECT id,from_username as from_user, body, sent_at, read_at FROM messages  WHERE to_username=$1`, [username])
    for (let msg of messages.rows) {
      let usr = await db.query(`SELECT first_name, last_name, phone, username FROM users WHERE username=$1`, [msg.from_user])
      msg.from_user = usr.rows[0]
    }
    return messages.rows
  }
}

module.exports = User;
