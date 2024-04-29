import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("voice_activity")
export class VoiceActivity {
  @PrimaryColumn("varchar")
  user_id!: string;

  @Column("varchar")
  guild_id!: string;

  @Column("bigint", { nullable: true })
  current_channel_id?: number;

  @Column("bigint", { default: 0 })
  total_voice_time!: number;

  @Column("timestamp", { nullable: true })
  current_session_start?: Date;

  @Column("bigint", { nullable: true })
  current_role_id?: number;
}
