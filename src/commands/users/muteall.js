const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    const roles = server.roles.cache;
    const channels = server.channels.cache;
    const members = server.members.cache.filter((m) => !m.user.bot);
    const existingMuteRole = roles.find((r) => r.name === "XSpammer--Muted");

    const continueCommand = (muteRole, channels, members) => {
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

      let muteSuccesses = 0;
      let muteFails = 0;
      setTimeout(() => {
        const progressBar = new ProgressBar({
          indeterminate: false,
          title: "XSpammer",
          text: "Wait...",
          detail: "Muting all users.",
          maxValue: members.size,
          closeOnComplete: false,
        })
          .on("completed", () => {
            progressBar.text = "Completed";
            progressBar.detail = `Muted all users, ${muteSuccesses} out of ${
              progressBar.getOptions().maxValue
            } users muted (${muteSuccesses} successes, ${muteFails} fails)`;
            setTimeout(() => progressBar.close(), 1500);
          })
          .on(
            "progress",
            (value) =>
              (progressBar.detail = `Muting all users, ${muteSuccesses} out of ${
                progressBar.getOptions().maxValue
              } users muted (${muteSuccesses} successes, ${muteFails} fails)`)
          );

        members.forEach(async (member) => {
          await member.roles
            .add(muteRole)
            .then(() => {
              muteSuccesses += 1;
              progressBar.value += 1;
            })
            .catch(() => {
              muteFails += 1;
              progressBar.value += 1;
            });

          if (progressBar.value === progressBar.maxValue)
            progressBar.setCompleted();
        });
      }, 100);
    };

    if (existingMuteRole) continueCommand(existingMuteRole, channels, members);
    else
      server.roles
        .create({
          data: {
            name: "XSpammer--Muted",
            color: "RED",
          },
          reason: "Created by XSpammer",
        })
        .then((muteRole) => continueCommand(muteRole, channels, members))
        .catch(() =>
          remote.dialog.showMessageBox(null, {
            type: "error",
            title: "XSpammer",
            message: "An error occurred while trying to create a Muted role.",
          })
        );
  },
};
