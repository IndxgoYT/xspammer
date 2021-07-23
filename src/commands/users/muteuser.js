const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt(
      {
        title: "XSpammer",
        label: "Select a user:",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "select",
        selectOptions: server.members.cache
          .filter((m) => !m.user.bot)
          .reduce(function (result, item) {
            result[item.user.id] = item.user.tag;
            return result;
          }, {}),
      },
      {
        type: "warning",
        title: "XSpammer",
        message: "You didn't select a user.",
      }
    ).then((userid) => {
      const member = server.members.cache.get(userid);
      const roles = server.roles.cache;
      const channels = server.channels.cache;
      const existingMuteRole = roles.find((r) => r.name === "XSpammer--Muted");

      if (!member) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "An error occurred while trying to fetch the user.",
        });
        return;
      }

      const continueCommand = (muteRole, channels) => {
        try {
          const position = server.me.roles.highest.position - 1;
          if (position > 0) muteRole.setPosition(position);

          channels.forEach(
            async (channel) =>
              await channel.overwritePermissions(
                [
                  {
                    id: muteRole.id,
                    deny: ["SEND_MESSAGES", "ADD_REACTIONS"],
                  },
                ],
                "Updated by XSpammer"
              )
          );
        } catch {
          remote.dialog.showMessageBox(null, {
            type: "error",
            title: "XSpammer",
            message: "An error occurred while trying to set up the Muted role.",
          });
          return;
        }

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Muting ${member.user.tag}.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          await member.roles
            .add(muteRole)
            .then(() => (progressBar.detail = `Muted ${member.user.username}`))
            .catch(
              () =>
                (progressBar.detail = `Failed to mute ${member.user.username}`)
            )
            .finally(() => progressBar.setCompleted());
        }, 100);
      };

      if (existingMuteRole) continueCommand(existingMuteRole, channels);
      else
        server.roles
          .create({
            data: {
              name: "XSpammer--Muted",
              color: "RED",
            },
            reason: "Created by XSpammer",
          })
          .then((muteRole) => continueCommand(muteRole, channels))
          .catch(() =>
            remote.dialog.showMessageBox(null, {
              type: "error",
              title: "XSpammer",
              message: "An error occurred while trying to create a Muted role.",
            })
          );
    });
  },
};
