const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    if (server.roles.cache.filter((r) => r.name !== "@everyone").size < 1) {
      remote.dialog.showMessageBox(null, {
        type: "error",
        title: "XSpammer",
        message: "There aren't enough roles for this command.",
      });
      return;
    }

    showPrompt(
      {
        title: "XSpammer",
        label: "Select a role:",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "select",
        selectOptions: server.roles.cache
          .filter((r) => r.name !== "@everyone")
          .reduce(function (result, item) {
            result[item.id] = item.name;
            return result;
          }, {}),
      },
      {
        type: "warning",
        title: "XSpammer",
        message: "You didn't select a role.",
      }
    ).then((roleid) => {
      const role = server.roles.cache
        .filter((r) => r.name !== "@everyone")
        .get(roleid);

      if (!role) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "An error occurred while trying to fetch the role.",
        });
        return;
      }

      showPrompt({
        title: "XSpammer",
        label: "Name (optional):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((n) => {
        let name = n;
        if (!name) name = "XSpammer rules!";

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Renaming ${role.name}.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          const _name = name
            .replace(/\\n/g, "\n")
            .replace(/%server%/g, server.name);

          const prevName = role.name;

          await role
            .setName(_name)
            .then(() => (progressBar.detail = `Renamed ${prevName}`))
            .catch(() => (progressBar.detail = `Failed to rename ${role.name}`))
            .finally(() => progressBar.setCompleted());
        }, 100);
      });
    });
  },
};
