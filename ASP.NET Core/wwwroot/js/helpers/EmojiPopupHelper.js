const EMOJI_LIST = [
  { char: "😀", terms: "grinning face happy smile" },
  { char: "😂", terms: "joy tears laugh crying haha" },
  { char: "🥰", terms: "love hearts smiling affection" },
  { char: "😎", terms: "cool sunglasses glasses" },
  { char: "🤔", terms: "thinking hmm ponder" },
  { char: "🙌", terms: "celebration hands raise" },
  { char: "👍", terms: "thumbs up yes approve" },
  { char: "👎", terms: "thumbs down no bad" },
  { char: "🔥", terms: "fire hot lit trending" },
  { char: "🎉", terms: "party popper celebration" },
  { char: "💡", terms: "lightbulb idea genius" },
  { char: "🚀", terms: "rocket launch ship space" },
  { char: "👀", terms: "eyes looking seeing watch" },
  { char: "😢", terms: "sad cry tear" },
  { char: "😡", terms: "angry mad red furious" },
  { char: "💯", terms: "100 hundred perfect score" },
  { char: "✅", terms: "check mark done yes correct" },
  { char: "✨", terms: "sparkles magic shiny star" },
];

class EmojiPopupHelper {
  constructor(editorInstance) {
    this.editor = editorInstance;
    this.insertIndex = 0;

    this.popover = $("#emoji-popup").dxPopover("instance");
    this.searchBox = $("#emoji-search-box").dxTextBox("instance");

    this._renderEmojiGrid();
  }

  // Static event handler referenced from Razor
  static onSearchChanged(e) {
    const searchTerm = (e.value || "").toLowerCase().trim();
    $("#emoji-grid .emoji-item").each(function () {
      const terms = $(this).attr("data-terms");
      $(this).toggle(terms.includes(searchTerm));
    });
  }

  show(cursorIndex, targetElement) {
    this.insertIndex = cursorIndex;
    this.searchBox.option("value", "");

    this.popover.option("target", targetElement);
    this.popover.show();
  }

  _renderEmojiGrid() {
    const gridContainer = $("#emoji-grid");

    EMOJI_LIST.forEach((emojiObj) => {
      $("<div>")
        .text(emojiObj.char)
        .addClass("emoji-item")
        .attr("data-terms", emojiObj.terms)
        .css({
          fontSize: "22px",
          cursor: "pointer",
          userSelect: "none",
          textAlign: "center",
          padding: "8px 0",
          borderRadius: "6px",
          transition: "background-color 0.15s ease",
        })
        .hover(
          function () { $(this).css("background-color", "#f0f0f0"); },
          function () { $(this).css("background-color", "transparent"); },
        )
        .on("mousedown", (e) => e.preventDefault())
        .on("click", () => this._insertEmoji(emojiObj))
        .appendTo(gridContainer);
    });
  }

  _insertEmoji(emojiObj) {
    this.popover.hide();
    this.editor.insertText(this.insertIndex, emojiObj.char);
    this.editor.setSelection(this.insertIndex + emojiObj.char.length, 0);
  }
}
