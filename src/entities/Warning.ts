import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("warning")
export class Warning {
  @PrimaryGeneratedColumn("increment")
  warning_id!: number;

  @Column({ type: "varchar", length: 50, nullable: false })
  username!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  reason!: string;

  @Column({ type: "varchar", length: 50, nullable: false })
  moderator!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  warned_on!: Date;
}
