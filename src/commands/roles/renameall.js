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
      if (!name) name = "XSpammer rules!";

      let nameSuccesses = 0;
      let nameFails = 0;
      const roles = server.roles.cache.filter((r) => r.name !== "@everyone");
      if (roles.size < 1) {
        remote.dialog.showMessageBox(null, {
          type: "error",
          title: "XSpammer",
          message: "There aren't enough roles for this command.",
        });
        return;
      }
      setTimeout(() => {
        const progressBar = new ProgressBar({
          indeterminate: false,
          title: "XSpammer",
          text: "Wait...",
          detail: "Renaming all roles.",
          maxValue: roles.size,
          closeOnComplete: false,
        })
          .on("completed", () => {
            progressBar.text = "Completed";
            progressBar.detail = `Renamed all roles, ${nameSuccesses} out of ${
              progressBar.getOptions().maxValue
            } roles renamed (${nameSuccesses} successes, ${nameFails} fails)`;
            setTimeout(() => progressBar.close(), 1500);
          })
          .on(
            "progress",
            (value) =>
              (progressBar.detail = `Renaming all roles, ${nameSuccesses} out of ${
                progressBar.getOptions().maxValue
              } roles renamed (${nameSuccesses} successes, ${nameFails} fails)`)
          );

        roles.forEach(async (role) => {
          const _name = name
            .replace(/\\n/g, "\n")
            .replace(/%server%/g, server.name);

          await role
            .setName(_name)
            .then(() => {
              nameSuccesses += 1;
              progressBar.value += 1;
            })
            .catch(() => {
              nameFails += 1;
              progressBar.value += 1;
            });

          if (progressBar.value === progressBar.maxValue)
            progressBar.setCompleted();
        });
      }, 100);
    });
  },
};
