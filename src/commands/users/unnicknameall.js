const { remote } = require("electron");
const ProgressBar = remote.getGlobal("ProgressBar");

module.exports = {
  execute(server, showPrompt) {
    let unnicknameSuccesses = 0;
    let unnicknameFails = 0;
    const members = server.members.cache.filter((m) => !m.user.bot);
    setTimeout(() => {
      const progressBar = new ProgressBar({
        indeterminate: false,
        title: "XSpammer",
        text: "Wait...",
        detail: "Unnicknaming all users.",
        maxValue: members.size,
        closeOnComplete: false,
      })
        .on("completed", () => {
          progressBar.text = "Completed";
          progressBar.detail = `Unnicknamed all users, ${unnicknameSuccesses} out of ${
            progressBar.getOptions().maxValue
          } users unnicknamed (${unnicknameSuccesses} successes, ${unnicknameFails} fails)`;
          setTimeout(() => progressBar.close(), 1500);
        })
        .on(
          "progress",
          (value) =>
            (progressBar.detail = `Unnicknaming all users, ${unnicknameSuccesses} out of ${
              progressBar.getOptions().maxValue
            } users unnicknamed (${unnicknameSuccesses} successes, ${unnicknameFails} fails)`)
        );

      members.forEach(async (member) => {
        await member
          .setNickname("")
          .then(() => {
            unnicknameSuccesses += 1;
            progressBar.value += 1;
          })
          .catch(() => {
            unnicknameFails += 1;
            progressBar.value += 1;
          });

        if (progressBar.value === progressBar.maxValue)
          progressBar.setCompleted();
      });
    }, 100);
  },
};
