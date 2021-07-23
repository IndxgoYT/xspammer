const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  async execute(server, showPrompt) {
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

      showPrompt(
        {
          title: "XSpammer",
          label: "Select a user:",
          alwaysOnTop: true,
          skipTaskbar: false,
          type: "select",
          selectOptions: users.reduce(function (result, item) {
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
        const user = bans.get(userid);

        if (!user) {
          remote.dialog.showMessageBox(null, {
            type: "error",
            title: "XSpammer",
            message: "An error occurred while trying to fetch the user.",
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

          setTimeout(async () => {
            const progressBar = new ProgressBar({
              title: "XSpammer",
              text: "Wait...",
              detail: `Unbanning ${user.user.tag}.`,
            }).on("completed", () => {
              progressBar.text = "Completed";
              setTimeout(() => progressBar.close(), 1500);
            });

            const rsn = reason
              .replace(/\\n/g, "\n")
              .replace(/%username%/g, user.user.username)
              .replace(/%userid%/g, user.user.id)
              .replace(/%usertag%/g, user.user.tag)
              .replace(/%server%/g, server.name);

            await server.members
              .unban(user.user.id, rsn)
              .then(
                () => (progressBar.detail = `Unbanned ${user.user.username}`)
              )
              .catch(
                () =>
                  (progressBar.detail = `Failed to unban ${user.user.username}`)
              )
              .finally(() => progressBar.setCompleted());
          }, 100);
        });
      });
    });
  },
};
