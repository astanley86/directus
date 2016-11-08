//  Slug Core UI component
//  Directus 6.0

//  (c) RANGER
//  Directus may be freely distributed under the GNU license.
//  For all details and documentation:
//  http://www.getdirectus.com
/*jshint multistr: true */

define(['app', 'core/UIComponent', 'core/UIView', 'core/t'], function(app, UIComponent, UIView, __t) {

  'use strict';

  var template = '<input type="text" value="{{value}}" name="{{name}}" id="{{name}}" maxLength="{{maxLength}}" class="{{size}}" {{#if readonly}}readonly{{/if}}/>'+
                 '<span class="char-count hide">{{characters}}</span>';

  var Input = UIView.extend({
    templateSource: template,

    events: {
      'change input': function() {
        this.$el.find('.char-count').show();
      }
    },

    afterRender: function(e) {
      if (this.options.settings.get("readonly") === "on") this.$("input").prop("readonly",true);
      var mirrored_field = this.options.settings.get("mirrored_field");
      var slug_field = this.$el.find('input');
      $('#'+mirrored_field).keyup(function(){
        var slug = $(this).val();

        slug = slug.replace(/^\s+|\s+$/g, ''); // trim
        slug = slug.toLowerCase();

        // Remove accents, swap ñ for n, etc
        var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
        var to   = "aaaaaeeeeeiiiiooooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
        slug = slug.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        slug = slug.replace(/[^a-z0-9 \-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

        slug_field.val(slug);
      });
    },

    serialize: function() {
      var length = this.options.schema.get('char_length');
      var value = this.options.value || '';

      return {
        size: this.options.settings.get('size'),
        value: value,
        name: this.options.name,
        maxLength: length,
        comment: this.options.schema.get('comment'),
        readonly: this.options.settings.get('readonly') === true
      };
    }
  });

  var Component = UIComponent.extend({
    id: 'slug',
    dataTypes: ['VARCHAR'],
    variables: [
      // Disables editing of the field while still letting users see the value
      {id: 'readonly', type: 'Boolean', default_value: true, ui: 'checkbox'},
      // Adjusts the max width of the input (Small, Medium, Large)
      {id: 'size', type: 'String', default_value:'large', ui: 'select', options: {options: {'large':__t('size_large'),'medium':__t('size_medium'),'small':__t('size_small')} }},
      // Enter the column name of the field the slug will pull it's value from
      {id: 'mirrored_field', type: 'String', default_value: '', ui: 'textinput', char_length: 200}
    ],
    Input: Input,
    validate: function(value, options) {
      if (options.schema.isRequired() && _.isEmpty(value)) {
        return 'This field is required';
      }
    },
    list: function(options) {
      return (options.value) ? options.value.toString().replace(/<(?:.|\n)*?>/gm, '').substr(0,100) : '';
    }
  });

  return Component;
});
