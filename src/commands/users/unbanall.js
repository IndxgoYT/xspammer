const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  async execute(server, showPrompt) {
    let unbanSuccesses = 0;
    let unbanFails = 0;
    await server.fetchBans().then((bans) => {
      let users = bans.filter((m) => !m.user.bot);

      if (users.size < 1) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "There are no users to unban.",
        });
        return;
      }

      showPrompt({
        title: "XSpammer",
        label: "Reason (optional):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((r) => {
        let reason = r;
        if (!reason) reason = "Unbanned by XSpammer";

        setTimeout(() => {
          const progressBar = new ProgressBar({
            indeterminate: false,
            title: "XSpammer",
            text: "Wait...",
            detail: "Unbanning all banned users.",
            maxValue: users.size,
            closeOnComplete: false,
          })
            .on("completed", () => {
              progressBar.text = "Completed";
              progressBar.detail = `Unbanned all users, ${unbanSuccesses} out of ${
                progressBar.getOptions().maxValue
              } users unbanned (${unbanSuccesses} successes, ${unbanFails} fails)`;
              setTimeout(() => progressBar.close(), 1500);
            })
            .on(
              "progress",
              (value) =>
                (progressBar.detail = `Unbanning all users, ${unbanSuccesses} out of ${
                  progressBar.getOptions().maxValue
                } users unbanned (${unbanSuccesses} successes, ${unbanFails} fails)`)
            );

          users.forEach(async (user) => {
            const rsn = reason
              .replace(/\\n/g, "\n")
              .replace(/%username%/g, user.user.username)
              .replace(/%userid%/g, user.user.id)
              .replace(/%usertag%/g, user.user.tag)
              .replace(/%server%/g, server.name);

            await server.members
              .unban(user.user.id, rsn)
              .then(() => {
                unbanSuccesses += 1;
                progressBar.value += 1;
              })
              .catch(() => {
                unbanFails += 1;
                progressBar.value += 1;
              });

            if (progressBar.value === progressBar.maxValue)
              progressBar.setCompleted();
          });
        }, 100);
      });
    });
  },
};
