# frozen_string_literal: true

class NotifyService < BaseService
  def call(recipient, activity)
    @recipient    = recipient
    @activity     = activity
    @notification = Notification.new(account: @recipient, activity: @activity)

    return if recipient.user.nil? || blocked?

    create_notification
    send_email if email_enabled?
  rescue ActiveRecord::RecordInvalid
    return
  end

  def send_push_notification_to_apps
    require 'net/https'
    require 'json'
    require "uri"
    uri = URI.parse("https://api.ionic.io/push/notifications")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    @body = {
    "profile" => "dev",
    "notification" => {
      "title" => "Cikiu alert system",
      "message" => "Someone sent an alert"
      },
      "send_to_all" =>  true
    }.to_json

    puts @body

    request = Net::HTTP::Post.new(uri.request_uri, initheader = {'Content-Type' =>'application/json', 'Authorization' => 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MmYyNzIxMi03NzIzLTRjZmYtODhlYS04MTI5NjRiNDRmODcifQ.CrN8g6Uemcqgz_2OC5JObWpUVY2e2nDcSutG0c7ykx0'})
    request.body = @body
    response = http.request(request)

    puts "Response #{response.code} #{response.message}: #{response.body}"
  end

  private

  def blocked_mention?
    FeedManager.instance.filter?(:mentions, @notification.mention.status, @recipient.id)
  end

  def blocked_favourite?
    false
  end

  def blocked_follow?
    false
  end

  def blocked_reblog?
    false
  end

  def blocked_follow_request?
    false
  end

  def blocked?
    blocked   = @recipient.suspended?                                                                                              # Skip if the recipient account is suspended anyway
    blocked ||= @recipient.id == @notification.from_account.id                                                                     # Skip for interactions with self
    blocked ||= @recipient.blocking?(@notification.from_account)                                                                   # Skip for blocked accounts
    blocked ||= (@notification.from_account.silenced? && !@recipient.following?(@notification.from_account))                       # Hellban
    blocked ||= (@recipient.user.settings.interactions['must_be_follower']  && !@notification.from_account.following?(@recipient)) # Options
    blocked ||= (@recipient.user.settings.interactions['must_be_following'] && !@recipient.following?(@notification.from_account)) # Options
    blocked ||= send("blocked_#{@notification.type}?")                                                                             # Type-dependent filters
    blocked
  end

  def create_notification
    @notification.save!
    return unless @notification.browserable?
    Redis.current.publish("timeline:#{@recipient.id}", Oj.dump(event: :notification, payload: InlineRenderer.render(@notification, @recipient, 'api/v1/notifications/show')))
  end

  def send_email
    NotificationMailer.send(@notification.type, @recipient, @notification).deliver_later
  end

  def email_enabled?
    @recipient.user.settings.notification_emails[@notification.type]
  end

end
