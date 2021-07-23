const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Kick reason (optional):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((r) => {
      let reason = r;
      if (!reason) reason = "Kicked by XSpammer";

      let kickSuccesses = 0;
      let kickFails = 0;
      const members = server.members.cache.filter((m) => !m.user.bot);
      setTimeout(() => {
        const progressBar = new ProgressBar({
          indeterminate: false,
          title: "XSpammer",
          text: "Wait...",
          detail: "Kicking all users.",
          maxValue: members.size,
          closeOnComplete: false,
        })
          .on("completed", () => {
            progressBar.text = "Completed";
            progressBar.detail = `Kicked all users, ${kickSuccesses} out of ${
              progressBar.getOptions().maxValue
            } users kicked (${kickSuccesses} successes, ${kickFails} fails)`;
            setTimeout(() => progressBar.close(), 1500);
          })
          .on(
            "progress",
            (value) =>
              (progressBar.detail = `Kicking all users, ${kickSuccesses} out of ${
                progressBar.getOptions().maxValue
              } users kicked (${kickSuccesses} successes, ${kickFails} fails)`)
          );

        members.forEach(async (member) => {
          const rsn = reason
            .replace(/\\n/g, "\n")
            .replace(/%username%/g, member.user.username)
            .replace(/%userid%/g, member.user.id)
            .replace(/%usertag%/g, member.user.tag)
            .replace(/%server%/g, server.name);

          await member
            .kick(rsn)
            .then(() => {
              kickSuccesses += 1;
              progressBar.value += 1;
            })
            .catch(() => {
              kickFails += 1;
              progressBar.value += 1;
            });

          if (progressBar.value === progressBar.maxValue)
            progressBar.setCompleted();
        });
      }, 100);
    });
  },
};
