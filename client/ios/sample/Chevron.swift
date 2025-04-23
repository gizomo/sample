//
//  ChevronShape.swift
//  sample
//
//  Created by Ivan Godenov on 14.02.2025.
//

import UIKit

class Chevron: UIView {
    private var offset: CGFloat = 0.0
    private var initX: CGFloat = 0.0

    override init(frame: CGRect) {
        initX = frame.origin.x - frame.size.width
        super.init(frame: CGRect(x: initX, y: frame.origin.y, width: frame.size.width, height: frame.size.height))
        backgroundColor = .clear
    }

    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        backgroundColor = .clear
    }

    @objc func animateFromLeft(value: CGFloat) {
        if value > 0 && value < 1 {
            offset = value

            if let bounds = self.superview?.bounds {
                self.frame.origin.x = initX + bounds.width * 0.15 * value
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else if value >= 1 && 1 != offset {
            offset = 1

            if let bounds = self.superview?.bounds {
                self.frame.origin.x = initX + bounds.width * 0.15
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else if value <= 0 && 0 != offset {
            offset = 0
            
            if let bounds = self.superview?.bounds {
                self.frame.origin.x = initX
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else {
            return
        }

        self.setNeedsDisplay()
    }
    
    @objc func animateFromRight(value: CGFloat) {
        if value > 0 && value < 1 {
            offset = value

            if let bounds = self.superview?.bounds {
                self.frame.origin.x = bounds.width - bounds.width * 0.15 * value
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else if value >= 1 && 1 != offset {
            offset = 1

            if let bounds = self.superview?.bounds {
                self.frame.origin.x = bounds.width - bounds.width * 0.15
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else if value <= 0 && 0 != offset {
            offset = 0
            
            if let bounds = self.superview?.bounds {
                self.frame.origin.x = bounds.width
                self.frame.origin.y = bounds.height / 2 - 20
            }
        } else {
            return
        }

        self.setNeedsDisplay()
    }
    
    @objc func hide() {
        UIView.animate(withDuration: 0.2) {
            if let bounds = self.superview?.bounds {
                self.frame.origin.x > bounds.width / 2
                    ? self.animateFromRight(value: 0)
                    : self.animateFromLeft(value: 0)
            }
        } completion: { finished in
            if let bounds = self.superview?.bounds {
                self.frame.origin.x > bounds.width / 2
                    ? self.animateFromRight(value: 0)
                    : self.animateFromLeft(value: 0)
            }
        }
    }

    override func draw(_ rect: CGRect) {
        let path = UIBezierPath()

        let width = rect.width
        let height = rect.height

        let verticalCenter = height / 2
        let horizontalCenter = width / 2
        let tipStartingPoint = (horizontalCenter - offset * horizontalCenter) + 2

        UIColor.white.setStroke()

        path.move(to: .init(x: width - 2, y: 2))
        path.addLine(to: .init(x: tipStartingPoint, y: verticalCenter))
        path.addLine(to: .init(x: width - 2, y: height - 2))
        path.lineWidth = 4.0
        path.lineCapStyle = .round
        path.lineJoinStyle = .round
        path.stroke(with: .color, alpha: 0.3)
    }
}
