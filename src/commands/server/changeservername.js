const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Server name (optional):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((n) => {
      let name = n;
      if (!name) name = "XSpammer rules!";

      if (name < 2 || name > 32) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "The server name must be between 2 and 32 characters long.",
        });
        return;
      }

      setTimeout(async () => {
        const progressBar = new ProgressBar({
          title: "XSpammer",
          text: "Wait...",
          detail: `Changing server name to '${name}'.`,
        }).on("completed", () => {
          progressBar.text = "Completed";
          setTimeout(() => progressBar.close(), 1500);
        });

        await server
          .setName(name)
          .then(() => (progressBar.detail = `Changed server name to '${name}'`))
          .catch(
            () =>
              (progressBar.detail = `Failed to change server name to '${name}'`)
          )
          .finally(() => progressBar.setCompleted());
      }, 100);
    });
  },
};
