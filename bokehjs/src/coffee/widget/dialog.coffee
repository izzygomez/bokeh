_ = require "underscore"
$ = require "jquery"
$1 = require "bootstrap/modal"
Collection = require "../common/collection"
ContinuumView = require "../common/continuum_view"
HasProperties = require "../common/has_properties"
dialog_template = require "./dialog_template"

class DialogView extends ContinuumView

  initialize: (options) ->
    super(options)
    @render()
    @listenTo(@model, 'destroy', @remove)
    @listenTo(@model, 'change:visible', @change_visibility)
    @listenTo(@model, 'change:content', @change_content)

  render: () ->
    @$modal = $(dialog_template(@model.attributes))
    @$modal.modal({show: @mget("visible")})
    @$modal.on('hidden.bk-bs.modal', @onHide)
    @$el.html(@$modal)
    return @

  onHide: (event) =>
    @mset("visible", false, {silent: true})

  change_visibility: () =>
    @$modal.modal(if @mget("visible") then "show" else "hide")

  change_content: () =>
    @$modal.find(".bk-bs-modal-body").text(@mget("content"))

class Dialog extends HasProperties
  type: "Dialog"
  default_view: DialogView

  defaults: () ->
    return _.extend {}, super(), {
      visible: false
      closable: true
      title: ""
      content: ""
      buttons: []
    }

class Dialogs extends Collection
  model: Dialog

module.exports =
  Model: Dialog
  View: DialogView
  Collection: new Dialogs()