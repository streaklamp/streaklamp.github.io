export default class extends Stimulus.Controller {
  static targets = ["lampColor", "message", "usernameInput"]
  static values  = { local: Boolean }

  static COLORS = {
    "broken": "#d7006c",
    "00": "#15a0e3",
    "01": "#15a0e3",
    "02": "#15a0e3",
    "03": "#15a0e3",
    "04": "#15a0e3",
    "05": "#15a0e3",
    "06": "#15a0e3",
    "07": "#15a0e3",
    "08": "#15a0e3",
    "09": "#15a0e3",
    "10": "#15a0e3",
    "11": "#15a0e3",
    "12": "#15a0e3",
    "13": "#15a0e3",
    "14": "#0cb18a",
    "15": "#d22c95",
    "16": "#855fff",
    "17": "#a034cc",
    "18": "#7269ff",
    "19": "#9e48f3",
    "20": "#cc165a",
    "21": "#af1f40",
    "22": "#2b013e",
    "23": "#701203",
  }

  async check(event) {
    event.preventDefault()
    this.#displayMessage("lookup-in-progress")

    const user = await this.#findUser()

    if (user == undefined) { return this.#handleUserNotFound() }

    const streakEndDate = dayjs(user["streakData"]["currentStreak"]["endDate"])

    if (this.#streakExtendedToday(streakEndDate)) {
      this.#hideLampColor()
      this.#displayMessage("streak-extended")
    }
    else if (this.#streakExtendedYesterday(streakEndDate)) {
      this.#displayMessage("streak-not-extended-yet")
      this.#showLampColor(streakEndDate.format("HH"))
    }
    else {
      this.#displayMessage("broken-streak")
      this.#showLampColor("broken")
    }
  }

  reset(event) {
    event.preventDefault()

    this.#hideLampColor()
    this.messageTarget.innerText = ""
  }

  #displayMessage(key) {
    const messages = {
      "broken-streak":           "oh no, it seems you've broken your streak 😿",
      "error":                   "oops, an error occurred while trying to find your profile. Please try again.",
      "lookup-in-progress":      "looking for you Duolingo profile...",
      "streak-extended":         "congrats! you've extended your streak today",
      "streak-not-extended-yet": "Don't forget to practice today!",
      "user-not-found":          "We're sorry. We couldn't find your Duolingo profile.",
    }

    return this.messageTarget.innerText = messages[key]
  }

  #handleUserNotFound() {
    this.#displayMessage("user-not-found")
    this.#hideLampColor()
  }

  #hideLampColor() { this.lampColorTarget.classList.add("hidden") }

  #showLampColor(key) {
    this.lampColorTarget.style.backgroundColor = this.constructor.COLORS[key]
    this.lampColorTarget.classList.remove("hidden")
  }

  #streakExtendedToday(streakEndDate) {
    return dayjs().isSame(streakEndDate, 'day')
  }

  #streakExtendedYesterday(streakEndDate) {
    const yesterday = dayjs().subtract(1, 'day')

    return yesterday.isSame(streakEndDate, 'day')
  }

  async #findUser() {
    const username = this.usernameInputTarget.value;

    if (this.#useLocalUsers()) { return this.#findLocalUser(username) }

    return await this.#findDuolingoUser(username)
  }

  async #findDuolingoUser(username) {
    const endpoint = `https://www.duolingo.com/2017-06-30/users?username=${username}`

    try {
      const response = await fetch(endpoint);

      if (!response.ok) {
        this.#displayMessage("error");
        return undefined;
      }

      const data = await response.json();
      return data["users"][0];
    } catch (error) {
      console.log("error trying to fetch Duolingo profile:", error);
      this.#displayMessage("error");
      return undefined;
    }
  }

  #findLocalUser(username) {
    const users = {
      // streak extended today
      "mael": {"users":[{"username":"Maeldd","totalXp":3708,"streakData":{"currentStreak":{"startDate":"2025-02-12","length":7,"endDate":"2025-02-19"}}}]},
      // streak extended yesterday
      "nico": {"users":[{"username":"nfilzi","totalXp":74838,"streakData":{"currentStreak":{"startDate":"2023-03-23","length":693,"endDate":"2025-02-18"}}}]},
      // broken streak (ish)
      "cecile": {"users":[{"username":"Cecile900074","totalXp":518886,"streakData":{"currentStreak":{"startDate":"2019-10-14","length":3116,"endDate":"2025-02-17"}}}]},
    }

    const data = users[username] || { users: [] }

    return data["users"][0]
  }

  #useLocalUsers() {
    return this.localValue;
  }
}
