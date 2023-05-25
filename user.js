// User.js
const { Entity, PrimaryGeneratedColumn, Column } = require('typeorm');

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  name;

  @Column()
  email;

  @Column()
  password;
}

module.exports = User;
