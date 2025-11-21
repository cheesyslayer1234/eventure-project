class Event {
    constructor(name, description, date, time, location, image) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.time = time;
        this.location = location;
        this.image = image
        const random = Math.floor(Math.random() * 1000);
        const timestamp = Date.now();
        this.id = timestamp + "" + random.toString().padStart(3, '0');
    }
}
module.exports = { Event };