import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("voice_chat_roles")
export class VoiceChatRole {
  @PrimaryColumn("bigint")
  role_id!: number;

  @Column("text")
  role_name!: string;

  @Column("bigint")
  time_requirement!: number;
}
