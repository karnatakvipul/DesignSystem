import * as React from "react";
import { Pencil, ShieldCheck, KeyRound } from "lucide-react";

/** Links to rename the user, change permission and change password. */
export function ProfileActions({ onRename, onChangePermission, onChangePassword }) {
  const actions = [
    { label: "Rename user", icon: <Pencil size={14} />, onClick: onRename },
    { label: "Change permission", icon: <ShieldCheck size={14} />, onClick: onChangePermission },
    { label: "Change password", icon: <KeyRound size={14} />, onClick: onChangePassword },
  ];
  return (
    <div className="flex flex-col gap-1">
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={() => a.onClick?.()}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-body text-accent hover:bg-accent-muted"
        >
          {a.icon}
          {a.label}
        </button>
      ))}
    </div>
  );
}
