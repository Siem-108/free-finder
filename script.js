<form onsubmit="sendMail(event)">
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required />
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required />
  </div>
  <div class="form-group">
    <label for="Subject">Subject</label>
    <input type="text" id="Subject" name="Subject" required />
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" required></textarea>
  </div>
  <button type="submit">Send</button>
</form>
