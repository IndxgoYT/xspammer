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

      showPrompt({
        title: "XSpammer",
        label: "Amount (0 for max):",
        alwaysOnTop: true,
        skipTaskbar: false,
        type: "input",
      }).then((a) => {
        const roles = server.roles.cache;
        let amount = parseInt(a);

        if (amount === 0) amount = 250 - roles.size;
        if (isNaN(amount) || amount < 1) amount = 1;

        if (amount + roles.size > 250) {
          remote.dialog.showMessageBox(null, {
            type: "error",
            title: "XSpammer",
            message: `The maximum amount of roles you can create are ${
              250 - roles.size
            } roles due to discord limitations.`,
          });
          return;
        }

        let createSuccesses = 0;
        let createFails = 0;
        setTimeout(async () => {
          const progressBar = new ProgressBar({
            indeterminate: false,
            title: "XSpammer",
            text: "Wait...",
            detail: `Creating ${amount} roles.`,
            maxValue: amount,
            closeOnComplete: false,
          })
            .on("completed", () => {
              progressBar.text = "Completed";
              progressBar.detail = `Creating ${amount} roles, ${createSuccesses} out of ${
                progressBar.getOptions().maxValue
              } roles created (${createSuccesses} successes, ${createFails} fails)`;
              setTimeout(() => progressBar.close(), 1500);
            })
            .on(
              "progress",
              (value) =>
                (progressBar.detail = `Creating ${amount} roles, ${createSuccesses} out of ${
                  progressBar.getOptions().maxValue
                } roles created (${createSuccesses} successes, ${createFails} fails)`)
            );

          const _name = name
            .replace(/\\n/g, "\n")
            .replace(/%server%/g, server.name);

          await [...Array(amount)].forEach(async () => {
            await server.roles
              .create({
                data: {
                  name: _name,
                },
                reason: "Created by XSpammer",
              })
              .then(() => {
                createSuccesses += 1;
                progressBar.value += 1;
              })
              .catch(() => {
                createFails += 1;
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
