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

      if (!member) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "An error occurred while trying to fetch the user.",
        });
        return;
      }

      showPrompt({
        title: "XSpammer",
        label: "Nickname (optional):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((n) => {
        let nickname = n;
        if (!nickname) nickname = "XSpammer rules!";

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Nicknaming ${member.user.tag}.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          const nick = nickname
            .replace(/\\n/g, "\n")
            .replace(/%username%/g, member.user.username)
            .replace(/%userid%/g, member.user.id)
            .replace(/%usertag%/g, member.user.tag)
            .replace(/%server%/g, server.name);

          await member
            .setNickname(nick)
            .then(
              () => (progressBar.detail = `Nicknamed ${member.user.username}`)
            )
            .catch(
              () =>
                (progressBar.detail = `Failed to nickname ${member.user.username}`)
            )
            .finally(() => progressBar.setCompleted());
        }, 100);
      });
    });
  },
};
