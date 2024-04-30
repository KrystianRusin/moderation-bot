import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { VoiceChatRole } from "./VoiceRoles";

// **User Entity**
@Entity("users")
export class Users {
  @PrimaryColumn({ type: "varchar", length: 255 })
  user_id!: string;

  @Column({ type: "varchar", length: 255 })
  username!: string;

  @ManyToOne(() => VoiceChatRole)
  @JoinColumn({ name: "voice_chat_role_id" })
  voice_chat_role_id!: VoiceChatRole;

  @Column({ type: "timestamp" })
  date_joined!: Date;

  @Column({ type: "int", default: 0 })
  warning_count!: number;

  @Column({ type: "bigint" })
  time_spent_in_voice!: number;

  @Column({ type: "timestamp", nullable: true })
  current_voice_session_start?: Date;
}
