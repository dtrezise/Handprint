import XCTest

final class HandprintOnboardingUITests: XCTestCase {
    func testOnboardingCanReachSearchAndRSVP() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset"]
        app.launch()

        completeOnboarding(in: app)

        let searchButton = app.buttons["reach-search-button"]
        XCTAssertTrue(searchButton.waitForExistence(timeout: 5))
        searchButton.tap()

        let rsvpButton = app.buttons["action-rsvp-food-shelf-saturday"]
        XCTAssertTrue(rsvpButton.waitForExistence(timeout: 5))
        rsvpButton.tap()

        XCTAssertTrue(app.buttons["action-rsvp-food-shelf-saturday"].exists)

        let clearButton = app.buttons["reach-clear-button"]
        XCTAssertTrue(clearButton.isEnabled)
        clearButton.tap()
        XCTAssertFalse(app.buttons["action-rsvp-food-shelf-saturday"].exists)
    }

    func testCustomTabBarAndProfileSettingsRoutesAreReachable() {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing-reset"]
        app.launch()

        completeOnboarding(in: app)

        for identifier in ["tab-reach", "tab-print", "tab-wave", "tab-shake"] {
            XCTAssertTrue(app.buttons[identifier].waitForExistence(timeout: 5), "\(identifier) should be visible in the custom tab bar.")
        }

        for identifier in ["tab-reach", "tab-print", "tab-wave", "tab-shake"] {
            app.buttons[identifier].tap()
            XCTAssertTrue(app.buttons["profile-settings-button"].waitForExistence(timeout: 5), "Profile settings should be reachable from \(identifier).")
        }

        app.buttons["tab-print"].tap()
        XCTAssertTrue(app.buttons["profile-settings-button"].waitForExistence(timeout: 5))
        app.buttons["profile-settings-button"].tap()
        XCTAssertTrue(app.buttons["settings-account"].waitForExistence(timeout: 5))
        app.buttons["settings-account"].tap()
        XCTAssertTrue(app.textFields["field-name"].waitForExistence(timeout: 5))
    }

    func testAccessibilityTextKeepsPrimaryReachActionsUsable() {
        let app = XCUIApplication()
        app.launchArguments = [
            "-ui-testing-reset",
            "-UIPreferredContentSizeCategoryName",
            "UICTContentSizeCategoryAccessibilityExtraExtraExtraLarge"
        ]
        app.launch()

        completeOnboarding(in: app)

        XCTAssertTrue(app.buttons["reach-search-button"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["reach-search-button"].isHittable)
        XCTAssertTrue(app.buttons["reach-clear-button"].exists)

        for identifier in ["tab-reach", "tab-print", "tab-wave", "tab-shake"] {
            XCTAssertTrue(app.buttons[identifier].exists, "\(identifier) should remain available at accessibility text sizes.")
        }
    }

    func testWaveProgressiveDisclosuresOpen() {
        let app = launchAndCompleteOnboarding(arguments: ["-ui-testing-reset"])

        app.buttons["tab-wave"].tap()
        let conversation = app.descendants(matching: .any)["wave-conversation-disclosure"]
        XCTAssertTrue(conversation.waitForExistence(timeout: 5))
        conversation.tap()
        XCTAssertTrue(app.buttons["Post affirming comment"].waitForExistence(timeout: 5))

        let publicPreview = app.descendants(matching: .any)["wave-public-preview-disclosure"]
        XCTAssertTrue(publicPreview.waitForExistence(timeout: 5))
        publicPreview.tap()
        XCTAssertTrue(app.staticTexts["What others will see"].waitForExistence(timeout: 5))
    }

    func testLandscapeKeepsCoreNavigationUsable() {
        let app = launchAndCompleteOnboarding(arguments: ["-ui-testing-reset"])
        XCUIDevice.shared.orientation = .landscapeLeft
        addTeardownBlock { XCUIDevice.shared.orientation = .portrait }

        XCTAssertTrue(app.buttons["reach-search-button"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["tab-wave"].isHittable)
        app.buttons["tab-wave"].tap()
        XCTAssertTrue(app.navigationBars["Wave"].waitForExistence(timeout: 5))
    }

    func testLongContentDoesNotHidePrimaryActions() {
        let app = launchAndCompleteOnboarding(arguments: ["-ui-testing-reset", "-ui-testing-long-content"])

        app.buttons["reach-search-button"].tap()
        XCTAssertTrue(app.buttons["action-rsvp-food-shelf-saturday"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["tab-print"].isHittable)
        app.buttons["tab-print"].tap()
        XCTAssertTrue(app.buttons["profile-settings-button"].waitForExistence(timeout: 5))
    }

    func testEmptyAccountStillProvidesUsefulRoutes() {
        let app = launchAndCompleteOnboarding(arguments: ["-ui-testing-reset", "-ui-testing-empty-account"])

        app.buttons["tab-shake"].tap()
        XCTAssertTrue(app.staticTexts["No saved World Enablers"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["tab-reach"].isHittable)
    }

    func testLargeResultSetRemainsScrollableAndResponsive() {
        let app = launchAndCompleteOnboarding(arguments: ["-ui-testing-reset", "-ui-testing-large-results"])

        let search = app.buttons["reach-search-button"]
        XCTAssertTrue(search.waitForExistence(timeout: 5))
        search.tap()
        XCTAssertTrue(app.buttons["action-rsvp-load-test-0"].waitForExistence(timeout: 5))
        for _ in 0..<6 { app.swipeUp() }
        XCTAssertTrue(app.buttons["tab-wave"].isHittable)
    }

    func testReduceMotionAndIncreaseContrastKeepNavigationUsable() {
        let app = launchAndCompleteOnboarding(arguments: [
            "-ui-testing-reset",
            "-UIAccessibilityReduceMotionEnabled", "YES",
            "-UIAccessibilityDarkerSystemColorsEnabled", "YES"
        ])

        app.buttons["tab-shake"].tap()
        XCTAssertTrue(app.navigationBars["Shake"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["profile-settings-button"].isHittable)
    }

    private func launchAndCompleteOnboarding(arguments: [String]) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = arguments
        app.launch()
        completeOnboarding(in: app)
        return app
    }

    private func completeOnboarding(in app: XCUIApplication) {
        let primaryButton = app.buttons["onboarding-primary-button"]
        XCTAssertTrue(primaryButton.waitForExistence(timeout: 5))
        primaryButton.tap()
        primaryButton.tap()
        primaryButton.tap()
    }
}
