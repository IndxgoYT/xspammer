const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Ban reason (optional):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((r) => {
      let reason = r;
      if (!reason) reason = "Banned by XSpammer";

      let banSuccesses = 0;
      let banFails = 0;
      const members = server.members.cache.filter((m) => !m.user.bot);
      setTimeout(() => {
        const progressBar = new ProgressBar({
          indeterminate: false,
          title: "XSpammer",
          text: "Wait...",
          detail: "Banning all users.",
          maxValue: members.size,
          closeOnComplete: false,
        })
          .on("completed", () => {
            progressBar.text = "Completed";
            progressBar.detail = `Banned all users, ${banSuccesses} out of ${
              progressBar.getOptions().maxValue
            } users banned (${banSuccesses} successes, ${banFails} fails)`;
            setTimeout(() => progressBar.close(), 1500);
          })
          .on(
            "progress",
            (value) =>
              (progressBar.detail = `Banning all users, ${banSuccesses} out of ${
                progressBar.getOptions().maxValue
              } users banned (${banSuccesses} successes, ${banFails} fails)`)
          );

        members.forEach(async (member) => {
          const rsn = reason
            .replace(/\\n/g, "\n")
            .replace(/%username%/g, member.user.username)
            .replace(/%userid%/g, member.user.id)
            .replace(/%usertag%/g, member.user.tag)
            .replace(/%server%/g, server.name);

          await member
            .ban({ reason: rsn })
            .then(() => {
              banSuccesses += 1;
              progressBar.value += 1;
            })
            .catch(() => {
              banFails += 1;
              progressBar.value += 1;
            });

          if (progressBar.value === progressBar.maxValue)
            progressBar.setCompleted();
        });
      }, 100);
    });
  },
};
