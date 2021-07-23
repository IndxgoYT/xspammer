const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    showPrompt({
      title: "XSpammer",
      label: "Name (optional):",
      alwaysOnTop: true,
      skipTaskbar: false,
      type: "input",
    }).then((n) => {
      let name = n;
      if (!name) name = "xspammer-rules!";

      setTimeout(async () => {
        const progressBar = new ProgressBar({
          title: "XSpammer",
          text: "Wait...",
          detail: `Creating ${name}.`,
        }).on("completed", () => {
          progressBar.text = "Completed";
          setTimeout(() => progressBar.close(), 1500);
        });

        const _name = name
          .replace(/\\n/g, "\n")
          .replace(/%server%/g, server.name);

        await server.channels
          .create(_name, { reason: "Created by XSpammer" })
          .then(() => (progressBar.detail = `Created ${name}`))
          .catch(() => (progressBar.detail = `Failed to created ${name}`))
          .finally(() => progressBar.setCompleted());
      }, 100);
    });
  },
};
