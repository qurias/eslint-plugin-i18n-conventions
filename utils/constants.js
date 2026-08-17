'use strict'

module.exports = {
  /**
   * Functions whose arguments contain
   * user-facing text.
   *
   * toast('User created')
   * notify('Something went wrong')
   */
  DEFAULT_FUNCTIONS: [
    'toast',
    'notify',
    'alert',
    'confirm',
    'prompt',
  ],

  /**
   * Object properties that contain
   * user-facing text.
   *
   * {
   *   title: 'Delete user',
   *   message: 'Are you sure?'
   * }
   */
  DEFAULT_PROPERTIES: [
    'title',
    'label',
    'text',
    'message',
    'placeholder',
    'description',
    'caption',
    'tooltip',
    'content',
    'header',
    'subtitle',
  ],

  /**
   * Variable names that contain
   * user-facing text.
   *
   * const title = 'Delete user'
   * const message = 'Something went wrong'
   * const placeholder = 'Enter name'
   */
  DEFAULT_VARIABLES: [
    'title',
    'label',
    'text',
    'message',
    'placeholder',
    'description',
    'caption',
    'tooltip',
    'content',
    'header',
    'subtitle',
    'titleText',
    'labelText',
    'messageText',
    'descriptionText',
    'placeholderText',
  ],

  /**
   * Values that should not be translated.
   */
  DEFAULT_IGNORED_VALUES: [
    'success',
    'error',
    'warning',
    'info',
    'primary',
    'secondary',
    'default',
    'true',
    'false',
    'null',
    'undefined',
  ],

  /**
   * i18n functions.
   *
   * t('user.title')
   * $t('user.title')
   */
  DEFAULT_I18N_FUNCTIONS: [
    't',
    '$t',
  ],

  /**
   * i18n objects.
   *
   * i18n.t('user.title')
   * i18n.$t('user.title')
   */
  DEFAULT_I18N_OBJECTS: [
    'i18n',
  ],
}