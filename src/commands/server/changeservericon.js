const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");
const fs = require("fs");
const toArrayBuffer = require("buffer-to-arraybuffer");

module.exports = {
  execute(server, showPrompt) {
    remote.dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
      })
      .then((file) => {
        if (file.filePaths.length === 0) return;

        setTimeout(async () => {
          const progressBar = new ProgressBar({
            title: "XSpammer",
            text: "Wait...",
            detail: `Changing server icon.`,
          }).on("completed", () => {
            progressBar.text = "Completed";
            setTimeout(() => progressBar.close(), 1500);
          });

          fs.readFile(file.filePaths[0], async (err, data) => {
            if (err) {
              remote.dialog.showMessageBox(null, {
                type: "error",
                title: "XSpammer",
                message: "An error occurred while trying to read that image.",
              });
              return;
            }

            await server
              .setIcon(toArrayBuffer(data), "Changed by XSpammer")
              .then(() => (progressBar.detail = `Changed server icon.`))
              .catch(
                () => (progressBar.detail = `Failed to change server icon.`)
              )
              .finally(() => progressBar.setCompleted());
          });
        }, 100);
      });
  },
};
