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

      setTimeout(async () => {
        const progressBar = new ProgressBar({
          title: "XSpammer",
          text: "Wait...",
          detail: `Deleting ${role.name}.`,
        }).on("completed", () => {
          progressBar.text = "Completed";
          setTimeout(() => progressBar.close(), 1500);
        });

        await role
          .delete()
          .then(() => (progressBar.detail = `Deleted ${role.name}`))
          .catch(() => (progressBar.detail = `Failed to delete ${role.name}`))
          .finally(() => progressBar.setCompleted());
      }, 100);
    });
  },
};
