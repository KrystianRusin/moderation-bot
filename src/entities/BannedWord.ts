import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("banned_words")
export class BannedWord {
  @PrimaryGeneratedColumn("increment")
  word_id!: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  words!: string;
}
