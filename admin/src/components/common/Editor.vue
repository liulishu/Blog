<template>
  <div class="editor">
    <input type="text" class="title" id="title" v-model="title" @input="autosave">
    <div class="operate-bar">
      <section class="tag-container">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-tag"></use>
        </svg>
        <ul class="tags">
          <li class="tag" v-for="tag,index in getTags" :key="index">{{tag}}
          <sup @click="deleteTag(index)">X</sup>
          </li>
        </ul>
        <input v-if="showTags" type="text" class="tag-input" id="tag-input"  @keydown.enter="addTag">
        <span v-else @click="showTags = true" >+</span>
      </section>
      <section class="btn-container">
        <button id="delete" class="delete" @click="deleteArticle">删除文章</button>
        <button id="submit" class="not-del" @click="publishArticle">发布文章</button>
      </section>
    </div>
    <p class="tips">标签查询页面只能批量更改标签 修改的文章内容会自动保存</p>
    <div class="content">
      <textarea ></textarea>
    </div>
  </div>
</template>

<script>
  //引入编辑器
  import 'simplemde/dist/simplemde.min.css'
  import  SimpleMDE from 'simplemde'
  import { mapState,mapGetters } from 'vuex'
  import debounce from 'lodash.debounce'
  import request from '@/utils/request'
    export default {
      name: "Editor",
      data() {
        return {
          simplemde: '',//编辑器
          showTags: false  //默认不显示

        }
      },
      computed: {
        ...mapState(['id', 'content', 'isPublished']),
        ...mapGetters(['getTags']),
        //因为这个title是数据双向绑定的 因此 他可能会被改变 如果我们直接从mapstate中读取它的话
        //那么如果改变title的话  又因为他没有setter方法 就会导致无法直接改变state中的title
        title: {
          get() {
            return this.$store.state.title
          },
          set(value) {
            this.$store.commit('SET_TITLE', value)
          }
        }
      },
      mounted() {
        this.tags = this.$store.getters.getTags
        this.simplemde = new SimpleMDE({
          placeholder: 'Talk to me , what are you say...',
          spellcheck: false,
          toolbarTips: false
        });
        //将vuex里面正在编辑的相关文章的相关信息输出到编辑器里面
        this.simplemde.value(this.content)
        //绑定编辑器的按键事件 以及复制黏贴的时间发生
        this.simplemde.codemirror.on('keyHandler', () => this.autosave())
        this.simplemde.codemirror.on('inputRead', () => this.autosave())
      },
      //监控ID值得变化 如果一旦发生变化 就直接将内容变化
      watch: {
        id(newVal, oldVal) {
          this.simplemde.value(this.content)
        }
      },
      methods: {
        //避免发请求的次数过多
        autosave: debounce(function () {
          if (this.id) {
            this.$store.dispatch('saveArticle', {
              id: this.id,
              title: this.title,
              tags: this.getTags.join(','),
              content: this.simplemde.value(),
              isPublished: this.isPublished
            })
          }
        }, 1000),
        //删除标签
        deleteTag(index) {
          this.getTags.splice(index, 1)
          this.autosave()
        },
        //添加标签
        addTag() {
          //input显示的时候 显示这个
          if (this.showTags) {
            const newTag = document.querySelector('#tag-input').value

            this.getTags.push(newTag);
            //每次按下enter键的时候 都会自动保存
            this.autosave();

          }
          //只是一个单纯的切换功能 第一次点击+的时候  会显示input表单 第二次在input表单中输入内容 按下enter键就隐藏表单
          this.showTags = !this.showTags
        },
        //删除文章
        deleteArticle() {
          request({
            url: `/articles/${this.id}`,
            method: 'delete',
            data: {}
          }).then(res => {
            //删除之后 要更新视图 让视图中的文章跟着删除
            this.$store.commit('SET_DELETE_ARTICLE')
          }).catch(err => {
            console.log(err)
          })
        },
        //发布文章
        publishArticle() {
          if (!this.isPublished) {
            request({
              url: `/articles/publish/${this.id}`,
              method: 'put',
              data: {}
            }).then(res => {
              this.$store.commit('SET_PUBLISH_STATE')
            }).catch(err => {
              console.log(err)
            })
          }
        }

      }
    }
</script>

<style type="text/scss" lang="scss" scoped>
  @import '../../assets/style/variable';
  .title {
    margin-bottom: 0.3em;
    width: 100%;
    height: 2em;
    border: none;
    font-size: 2.4rem;
    color: $title;
    outline: none;
    border-bottom: 1px solid $special;
    background: none;
    text-align: center;
  }
  .operate-bar {
  @include flex($justify: space-between);
    height: 4em;
    font-size: 1.3rem;
    margin-bottom: 1em;
  .tag-container {
  @include flex($justify: flex-start);
  .icon {
    width: 1.5em;
    height: 1.5em;
    margin-right: 10px;
  }
  .tags {
  @include flex;
    list-style: none;
    margin-right: 10px;
    padding: 0;
  .tag {
    margin-right: 10px;
    color: $base;
    position: relative;
  &:last-child {
     margin-right: 0px;
   }
  }
  }
  .tag-add {
  font: {
    weight: 600;
    size: 1.6rem;
  }
  color: $special;
  /*text-decoration: underline;*/
  cursor: pointer;
  }
  }
  }
  .tips {
    color: $quote;
    text-align: center;
  }
  .content {
    font-size: 1.6rem;
  }
</style>
