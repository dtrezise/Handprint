import XCTest

final class HandprintOnboardingUITests: XCTestCase {
    func testOnboardingCanReachDiscoverAndRSVP() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset"]
        app.launch()

        let primaryButton = app.buttons["onboarding-primary-button"]
        XCTAssertTrue(primaryButton.waitForExistence(timeout: 5))
        primaryButton.tap()
        primaryButton.tap()
        primaryButton.tap()

        let rsvpButton = app.buttons["action-rsvp-food-shelf-saturday"]
        XCTAssertTrue(rsvpButton.waitForExistence(timeout: 5))
        rsvpButton.tap()

        XCTAssertTrue(app.buttons["action-rsvp-food-shelf-saturday"].exists)
    }
}
