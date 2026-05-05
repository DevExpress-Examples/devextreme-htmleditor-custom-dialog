<script setup lang="ts">
import { ref, shallowRef, type ComponentPublicInstance } from 'vue';

import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DxHtmlEditor, { DxToolbar, DxItem } from 'devextreme-vue/html-editor';

import EmojiPopup from './EmojiPopup.vue';
import VideoPopup from './VideoPopup.vue';
import LinkPopup from './LinkPopup.vue';
import MarkupPopup from './MarkupPopup.vue';
import markup from '../data/markup';

const editorInstance = shallowRef<any>(null);

const emojiPopupRef = ref<ComponentPublicInstance<typeof EmojiPopup> | null>(null);
const videoPopupRef = ref<ComponentPublicInstance<typeof VideoPopup> | null>(null);
const linkPopupRef = ref<ComponentPublicInstance<typeof LinkPopup> | null>(null);
const markupPopupRef = ref<ComponentPublicInstance<typeof MarkupPopup> | null>(null);

function onEditorInitialized(e: any) {
  editorInstance.value = e.component;
  (videoPopupRef.value as any)?.registerBlot(editorInstance.value);
}

function customizeModules(config: any) {
  (videoPopupRef.value as any)?.setupClipboard(config);
}

function onLinkClick() {
  const range = editorInstance.value.getSelection();
  const index = range ? range.index : editorInstance.value.getLength();
  const length = range ? range.length : 0;
  (linkPopupRef.value as any)?.show(index, length);
}

function onEmojiClick(e: any) {
  const range = editorInstance.value.getSelection();
  const index = range ? range.index : editorInstance.value.getLength();
  (emojiPopupRef.value as any)?.show(index, e.element);
}

function onVideoClick() {
  const range = editorInstance.value.getSelection();
  const index = range ? range.index : editorInstance.value.getLength();
  const length = range ? range.length : 0;
  (videoPopupRef.value as any)?.show(index, length);
}

function onMarkupClick() {
  (markupPopupRef.value as any)?.show();
}

const headerAcceptedValues = [false, 1, 2, 3, 4, 5];
</script>

<template>
  <div class="demo-container">
    <DxHtmlEditor
      :value="markup"
      :customize-modules="customizeModules"
      @initialized="onEditorInitialized"
    >
      <DxToolbar>
        <DxItem name="undo"/>
        <DxItem name="redo"/>
        <DxItem name="separator"/>
        <DxItem
          name="header"
          :accepted-values="headerAcceptedValues"
          :options="{ inputAttr: { 'aria-label': 'Header' } }"
        />
        <DxItem name="separator"/>
        <DxItem name="bold"/>
        <DxItem name="italic"/>
        <DxItem name="strike"/>
        <DxItem name="underline"/>
        <DxItem name="separator"/>
        <DxItem name="alignLeft"/>
        <DxItem name="alignCenter"/>
        <DxItem name="alignRight"/>
        <DxItem name="alignJustify"/>
        <DxItem name="separator"/>
        <DxItem
          widget="dxButton"
          :options="{
            icon: 'link',
            hint: 'Insert Custom Link',
            stylingMode: 'text',
            onClick: onLinkClick,
          }"
        />
        <DxItem
          widget="dxButton"
          :options="{
            text: '😀',
            hint: 'Insert Emoji',
            focusStateEnabled: false,
            stylingMode: 'text',
            onClick: onEmojiClick,
          }"
        />
        <DxItem
          widget="dxButton"
          :options="{
            icon: 'video',
            hint: 'Insert/Edit Video',
            stylingMode: 'text',
            onClick: onVideoClick,
          }"
        />
        <DxItem
          widget="dxButton"
          :options="{
            text: 'Display Markup',
            stylingMode: 'text',
            onClick: onMarkupClick,
          }"
        />
      </DxToolbar>
    </DxHtmlEditor>

    <EmojiPopup
      ref="emojiPopupRef"
      :editor="editorInstance"
    />
    <VideoPopup
      ref="videoPopupRef"
      :editor="editorInstance"
    />
    <LinkPopup
      ref="linkPopupRef"
      :editor="editorInstance"
    />
    <MarkupPopup
      ref="markupPopupRef"
      :editor="editorInstance"
    />
  </div>
</template>

<style scoped>
.demo-container {
  margin: 50px;
  width: 90vw;
}
</style>
