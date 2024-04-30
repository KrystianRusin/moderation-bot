import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Users } from "./Users";

@Entity("warnings")
export class Warning {
  @PrimaryGeneratedColumn("increment")
  warning_id!: number;

  @Column("varchar", { length: 255 })
  user_id!: string;

  @Column("varchar", { length: 255 })
  moderator_id!: string;

  @Column("text", { nullable: false })
  reason!: string;

  @Column("timestamp", { default: () => "CURRENT_TIMESTAMP" })
  warned_on!: Date;

  @ManyToOne(() => Users)
  @JoinColumn({ name: "user_id" })
  user!: Users;
}
