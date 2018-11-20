import {getToken,setToken,removeToken } from "@/utils/auth"
const state =  {
  //全局变量
  token:getToken(),  //登录凭证
  username:'',  //当前登录的用户名称  如果有需要的话可以存储一些用户的信息
  id:'',  //正在编辑的文章的id
  title:'',//正在编辑的文章的标题
  tags:'',//正在编辑的文章的列表
  content:'',//正在编辑文章的内容
  isPublished:'',//  文章是否发布
  toggleDelete:false

}
export default state
